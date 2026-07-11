const tuningPresets = require('./tuningPresets');

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STANDARD_TUNING = tuningPresets.getTuningById('standard').strings;

const RMS_THRESHOLD_ON = 0.008;
const RMS_THRESHOLD_OFF = 0.004;
const PEAK_CORR_THRESHOLD = 0.25;
const FREQ_MIN = 65;
const FREQ_MAX = 1100;

function freqToNote(freq) {
  if (!freq || freq <= 0) return { name: '--', cents: 0 };
  const semitone = Math.round(12 * Math.log2(freq / 440) + 69);
  const noteIndex = ((semitone % 12) + 12) % 12;
  const octave = Math.floor(semitone / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex] + octave;
  const expectedFreq = 440 * Math.pow(2, (semitone - 69) / 12);
  const cents = 1200 * Math.log2(freq / expectedFreq);
  return { name: noteName, cents: cents, semitone: semitone, freq: freq };
}

function calcCents(detectedFreq, targetFreq) {
  if (!detectedFreq || detectedFreq <= 0 || !targetFreq || targetFreq <= 0) return 0;
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

function centsToAngle(cents) {
  let angle = (cents / 50) * 90;
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
  const sorted = buf.slice().sort(function (a, b) {
    return a - b;
  });
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function detectPitch(samples, sampleRate, targetTunings) {
  if (!samples || samples.length < 200) return null;
  if (!sampleRate) sampleRate = 44100;

  const len = samples.length;

  let sumSq = 0;
  for (let i = 0; i < len; i++) sumSq += samples[i] * samples[i];
  const rms = Math.sqrt(sumSq / len);

  if (rms < RMS_THRESHOLD_ON) {
    return null;
  }

  let mean = 0;
  for (let i = 0; i < len; i++) mean += samples[i];
  mean /= len;
  for (let i = 0; i < len; i++) samples[i] -= mean;

  const minLag = Math.max(2, Math.floor(sampleRate / FREQ_MAX));
  const maxLag = Math.min(Math.floor(len / 2), Math.ceil(sampleRate / FREQ_MIN));

  const corrMap = {};
  const MAX_LIMIT = 1000;
  let globalMax = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sumP = 0,
      sumS1 = 0,
      sumS2 = 0;
    let limit = len - lag;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 50) continue;

    for (let j = 0; j < limit; j++) {
      sumP += samples[j] * samples[j + lag];
      sumS1 += samples[j] * samples[j];
      sumS2 += samples[j + lag] * samples[j + lag];
    }
    const d = Math.sqrt(sumS1 * sumS2);
    const corr = d > 1e-10 ? sumP / d : 0;
    corrMap[lag] = corr;
    if (corr > globalMax) globalMax = corr;
  }

  if (globalMax < PEAK_CORR_THRESHOLD) return null;

  const peakLags = [];
  const lags = Object.keys(corrMap)
    .map(Number)
    .sort(function (a, b) {
      return a - b;
    });
  for (let i = 1; i < lags.length - 1; i++) {
    const lag = lags[i];
    const prevVal = corrMap[lags[i - 1]];
    const val = corrMap[lag];
    const nextVal = corrMap[lags[i + 1]];
    if (val > prevVal && val > nextVal && val >= globalMax * 0.85) {
      peakLags.push({ lag: lag, corr: val });
    }
  }

  if (peakLags.length === 0) return null;

  peakLags.sort(function (a, b) {
    return a.lag - b.lag;
  });
  const bestLag = peakLags[0].lag;
  const bestCorr = corrMap[bestLag];
  let freq = sampleRate / bestLag;

  if (bestCorr < PEAK_CORR_THRESHOLD) return null;

  const lagFloat = parabolicInterpolation(samples, bestLag, len);
  if (lagFloat > 0) {
    freq = sampleRate / lagFloat;
  }

  if (freq < FREQ_MIN || freq > FREQ_MAX) return null;

  // 谐波校正：使用传入的目标频率列表（如果提供）
  const tuningList = targetTunings || STANDARD_TUNING;
  let isCloseToStandard = false;
  for (let si = 0; si < tuningList.length; si++) {
    if (Math.abs(freq / tuningList[si].frequency - 1) < 0.05) {
      isCloseToStandard = true;
      break;
    }
  }

  if (!isCloseToStandard) {
    let corrected = freq;
    for (let si = 0; si < tuningList.length; si++) {
      const stdFreq = tuningList[si].frequency;
      for (let mult = 2; mult <= 5; mult++) {
        const harmonicFreq = stdFreq * mult;
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

  let y1 = 0,
    y2 = 0,
    y3 = 0;
  let limit = len - lag - 1;
  if (limit > 500) limit = 500;

  for (let i = 0; i < limit; i++) {
    y1 += samples[i] * samples[i + lag - 1];
    y2 += samples[i] * samples[i + lag];
    y3 += samples[i] * samples[i + lag + 1];
  }
  y1 /= limit;
  y2 /= limit;
  y3 /= limit;

  const a = (y1 + y3 - 2 * y2) / 2;
  const b = (y3 - y1) / 2;
  if (Math.abs(a) < 1e-10) return -1;

  let delta = -b / (2 * a);
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
