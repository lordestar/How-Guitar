var tuningPresets = require('./tuningPresets');

var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var STANDARD_TUNING = tuningPresets.getTuningById('standard').strings;

var RMS_THRESHOLD_ON = 0.008;
var RMS_THRESHOLD_OFF = 0.004;
var PEAK_CORR_THRESHOLD = 0.25;
var FREQ_MIN = 65;
var FREQ_MAX = 1100;

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

function calcCents(detectedFreq, targetFreq) {
  if (!detectedFreq || detectedFreq <= 0 || !targetFreq || targetFreq <= 0) return 0;
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

function centsToAngle(cents) {
  var angle = (cents / 50) * 90;
  if (angle > 90) angle = 90;
  if (angle < -90) angle = -90;
  return angle;
}

function smoothEMA(value, prev, alpha) {
  if (prev === null || prev === undefined) return value;
  return prev + alpha * (value - prev);
}

function medianOfBuffer(buf) {
  if (!buf || buf.length === 0) return 0;
  var sorted = buf.slice().sort(function (a, b) { return a - b; });
  var mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function detectPitch(samples, sampleRate, targetTunings) {
  if (!samples || samples.length < 200) return null;
  if (!sampleRate) sampleRate = 44100;

  var len = samples.length;

  var sumSq = 0;
  for (var i = 0; i < len; i++) sumSq += samples[i] * samples[i];
  var rms = Math.sqrt(sumSq / len);

  if (rms < RMS_THRESHOLD_ON) {
    return null;
  }

  var mean = 0;
  for (var i = 0; i < len; i++) mean += samples[i];
  mean /= len;
  for (var i = 0; i < len; i++) samples[i] -= mean;

  var minLag = Math.max(2, Math.floor(sampleRate / FREQ_MAX));
  var maxLag = Math.min(Math.floor(len / 2), Math.ceil(sampleRate / FREQ_MIN));

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

  peakLags.sort(function (a, b) { return a.lag - b.lag; });
  var bestLag = peakLags[0].lag;
  var bestCorr = corrMap[bestLag];
  var freq = sampleRate / bestLag;

  if (bestCorr < PEAK_CORR_THRESHOLD) return null;

  var lagFloat = parabolicInterpolation(samples, bestLag, len);
  if (lagFloat > 0) {
    freq = sampleRate / lagFloat;
  }

  if (freq < FREQ_MIN || freq > FREQ_MAX) return null;

  // 谐波校正：使用传入的目标频率列表（如果提供）
  var tuningList = targetTunings || STANDARD_TUNING;
  var isCloseToStandard = false;
  for (var si = 0; si < tuningList.length; si++) {
    if (Math.abs(freq / tuningList[si].frequency - 1) < 0.05) {
      isCloseToStandard = true;
      break;
    }
  }

  if (!isCloseToStandard) {
    var corrected = freq;
    for (var si = 0; si < tuningList.length; si++) {
      var stdFreq = tuningList[si].frequency;
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

function parabolicInterpolation(samples, lag, len) {
  if (lag < 2 || lag >= len - 2) return -1;

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
