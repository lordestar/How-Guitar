// ============ utils/pitch.js ============
// 自相关音高检测引擎 — 稳定版
// 修复：提升噪声门限、提升相关度阈值、谐波验证、频率合法性检查

// ─── 标准调弦（从6弦到1弦） ───
var STANDARD_TUNING = [
  { string: 6, note: 'E2', name: '第6弦（低音E）', frequency: 82.41 },
  { string: 5, note: 'A2', name: '第5弦（A）',    frequency: 110.00 },
  { string: 4, note: 'D3', name: '第4弦（D）',    frequency: 146.83 },
  { string: 3, note: 'G3', name: '第3弦（G）',    frequency: 196.00 },
  { string: 2, note: 'B3', name: '第2弦（B）',    frequency: 246.94 },
  { string: 1, note: 'E4', name: '第1弦（高音E）', frequency: 329.63 },
];

var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ─── 噪声门限配置 ───
var RMS_THRESHOLD_ON = 0.008;   // 开启检测的门限
var RMS_THRESHOLD_OFF = 0.004;  // 关闭检测的释放门限（带滞后）
var PEAK_CORR_THRESHOLD = 0.25; // 自相关峰值相关度最低阈值
var FREQ_MIN = 65;    // 最低有效频率（略低于E2=82.41）
var FREQ_MAX = 1100;  // 最高有效频率

// ─── 频率 → 最近音名 + 音分 ───
function freqToNote(freq) {
  if (!freq || freq <= 0) return { name: '--', cents: 0 };
  var semitone = Math.round(12 * Math.log2(freq / 440) + 69);
  var noteIndex = ((semitone % 12) + 12) % 12;
  var octave = Math.floor(semitone / 12) - 1;
  var noteName = NOTE_NAMES[noteIndex] + octave;
  var expectedFreq = 440 * Math.pow(2, (semitone - 69) / 12);
  var cents = 1200 * Math.log2(freq / expectedFreq);
  return { name: noteName, cents: cents, semitone: semitone, freq: freq };
}

// ─── 计算频率相对于目标标准频率的音分偏差 ───
function calcCents(detectedFreq, targetFreq) {
  if (!detectedFreq || detectedFreq <= 0 || !targetFreq || targetFreq <= 0) return 0;
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

// ─── 音分 → 指针角度（±50音分 → ±90度）───
function centsToAngle(cents) {
  var angle = (cents / 50) * 90;
  if (angle > 90) angle = 90;
  if (angle < -90) angle = -90;
  return angle;
}

// ─── 指数平滑 ───
function smoothEMA(value, prev, alpha) {
  if (prev === null || prev === undefined) return value;
  return prev + alpha * (value - prev);
}

// ─── 滑动数组中位数 ───
function medianOfBuffer(buf) {
  if (!buf || buf.length === 0) return 0;
  var sorted = buf.slice().sort(function (a, b) { return a - b; });
  var mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// ─── 核心：自相关音高检测 ───
// samples: Float32Array（归一化 [-1, 1]）
// 返回: { frequency, confidence, rms } 或 null
function detectPitch(samples, sampleRate) {
  if (!samples || samples.length < 200) return null;
  if (!sampleRate) sampleRate = 44100;

  var len = samples.length;

  // === Step 1: RMS 能量检测（带滞后的噪声门限） ===
  var sumSq = 0;
  for (var i = 0; i < len; i++) sumSq += samples[i] * samples[i];
  var rms = Math.sqrt(sumSq / len);

  // 能量过低 → 不检测
  if (rms < RMS_THRESHOLD_ON) {
    return null;
  }

  // === Step 2: 去直流偏移 ===
  var mean = 0;
  for (var i = 0; i < len; i++) mean += samples[i];
  mean /= len;
  for (var i = 0; i < len; i++) samples[i] -= mean;

  // === Step 3: 自相关计算 + 峰值检测 ===
  // 策略：扫描所有 lag，记录自相关值。找全局最大相关度，
  // 然后选相关度 ≥ 全局最大 × 0.85 的峰值中 lag 最小的那个。
  // 这样保证选到的是最高频的显著自相关峰（真正的基频）。
  var minLag = Math.max(2, Math.floor(sampleRate / FREQ_MAX));
  var maxLag = Math.min(Math.floor(len / 2), Math.ceil(sampleRate / FREQ_MIN));

  // 记录每个 lag 的自相关值
  var corrMap = {};
  var MAX_LIMIT = 1000;
  var globalMax = 0;

  for (var lag = minLag; lag <= maxLag; lag++) {
    var sumP = 0, sumS1 = 0, sumS2 = 0;
    var limit = len - lag;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 50) continue;

    for (var j = 0; j < limit; j++) {
      sumP += samples[j] * samples[j + lag];
      sumS1 += samples[j] * samples[j];
      sumS2 += samples[j + lag] * samples[j + lag];
    }
    var d = Math.sqrt(sumS1 * sumS2);
    var corr = d > 1e-10 ? sumP / d : 0;
    corrMap[lag] = corr;
    if (corr > globalMax) globalMax = corr;
  }

  if (globalMax < PEAK_CORR_THRESHOLD) return null;

  // 找所有局部峰值
  var peakLags = [];
  var lags = Object.keys(corrMap).map(Number).sort(function(a,b){return a-b;});
  for (var i = 1; i < lags.length - 1; i++) {
    var lag = lags[i];
    var prevVal = corrMap[lags[i-1]];
    var val = corrMap[lag];
    var nextVal = corrMap[lags[i+1]];
    if (val > prevVal && val > nextVal && val >= globalMax * 0.85) {
      peakLags.push({ lag: lag, corr: val });
    }
  }

  if (peakLags.length === 0) return null;

  // 选峰值中 lag 最小的（最高频的显著周期 = 真正的基频）
  peakLags.sort(function (a, b) { return a.lag - b.lag; });
  var bestLag = peakLags[0].lag;
  var bestCorr = corrMap[bestLag];
  var freq = sampleRate / bestLag;

  // 只取最高相关度 ≥ 阈值的
  if (bestCorr < PEAK_CORR_THRESHOLD) return null;

  // === Step 5: 抛物线插值提高精度 ===
  var lagFloat = parabolicInterpolation(samples, bestLag, len);
  if (lagFloat > 0) {
    freq = sampleRate / lagFloat;
  }

  // 最终频率范围验证
  if (freq < FREQ_MIN || freq > FREQ_MAX) return null;

  // === Step 6: 验证 + 谐波校正 ===
  // 仅当检测到的频率与所有标准弦频率都不接近时，才尝试谐波校正
  // 检查是否接近（±5%以内）某一标准频率
  var isCloseToStandard = false;
  for (var si = 0; si < STANDARD_TUNING.length; si++) {
    if (Math.abs(freq / STANDARD_TUNING[si].frequency - 1) < 0.05) {
      isCloseToStandard = true;
      break;
    }
  }

  if (!isCloseToStandard) {
    // 只有不在标准频率附近时，才尝试谐波修正
    var corrected = freq;
    for (var si = 0; si < STANDARD_TUNING.length; si++) {
      var stdFreq = STANDARD_TUNING[si].frequency;
      for (var mult = 2; mult <= 5; mult++) {
        var harmonicFreq = stdFreq * mult;
        if (Math.abs(freq / harmonicFreq - 1) < 0.05) {
          corrected = freq / mult;
          break;
        }
      }
      if (corrected !== freq) break;
    }
    freq = corrected;
  }
  if (freq < FREQ_MIN || freq > FREQ_MAX) return null;

  return {
    frequency: freq,
    confidence: bestCorr,
    rms: rms,
  };
}

// ─── 抛物线插值 ───
function parabolicInterpolation(samples, lag, len) {
  if (lag < 2 || lag >= len - 2) return -1;

  // 取 lag-1, lag, lag+1 三点做抛物线拟合
  var y1 = 0, y2 = 0, y3 = 0;
  var limit = len - lag - 1;
  if (limit > 500) limit = 500;

  for (var i = 0; i < limit; i++) {
    y1 += samples[i] * samples[i + lag - 1];
    y2 += samples[i] * samples[i + lag];
    y3 += samples[i] * samples[i + lag + 1];
  }
  y1 /= limit;
  y2 /= limit;
  y3 /= limit;

  var a = (y1 + y3 - 2 * y2) / 2;
  var b = (y3 - y1) / 2;
  if (Math.abs(a) < 1e-10) return -1;

  var delta = -b / (2 * a);
  if (delta > 0.5) delta = 0.5;
  if (delta < -0.5) delta = -0.5;
  return lag + delta;
}

module.exports = {
  STANDARD_TUNING: STANDARD_TUNING,
  freqToNote: freqToNote,
  calcCents: calcCents,
  centsToAngle: centsToAngle,
  smoothEMA: smoothEMA,
  medianOfBuffer: medianOfBuffer,
  detectPitch: detectPitch,
  RMS_THRESHOLD_ON: RMS_THRESHOLD_ON,
  RMS_THRESHOLD_OFF: RMS_THRESHOLD_OFF,
};
