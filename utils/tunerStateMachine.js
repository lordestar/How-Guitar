// ============ utils/tunerStateMachine.js ============
// 调音器状态机 — 从 pages/tuner/tuner.js 的 onPitch/onStringDone 提取
// 管理音高检测结果的处理、中位数滤波、音准判定、弦切换逻辑

const pitch = require('./pitch');

/**
 * 调音状态机
 * @typedef {Object} TunerState
 * @property {number} stableCount - 连续音准帧计数
 * @property {number[]} freqHistory - 频率历史（中位数滤波用）
 * @property {number} drawAngle - 当前绘制角度
 * @property {number} smoothAngle - EMA 平滑后的角度
 * @property {number} STABLE_THRESHOLD - 音准稳定阈值（帧数）
 * @property {number} MEDIAN_WINDOW - 中位数滤波窗口大小
 */

/**
 * 创建调音状态机
 * @returns {import('./tunerStateMachine').TunerState}
 */
function createTunerState() {
  return {
    stableCount: 0,
    freqHistory: [],
    drawAngle: 0,
    smoothAngle: null,
    STABLE_THRESHOLD: 25,
    MEDIAN_WINDOW: 7,
  };
}

/**
 * 处理一帧音高检测结果
 * @param {import('./tunerStateMachine').TunerState} state - 状态机
 * @param {Object} result - pitch.detectPitch 的返回值 {frequency, confidence, rms} 或 null
 * @param {Object} currentInfo - 当前目标弦信息 {frequency, string}
 * @returns {Object|null} 处理结果：{statusClass, statusText, freqDisplay, noteDisplay, centsDisplay, isDone}
 *   如果无信号则返回 null
 */
function processPitch(state, result, currentInfo) {
  // 无有效检测：逐步归零
  if (!result || !result.frequency || result.confidence < 0.25) {
    if (state.smoothAngle !== null) {
      state.drawAngle = pitch.smoothEMA(0, state.drawAngle, 0.05);
      if (Math.abs(state.drawAngle) < 1) state.drawAngle = 0;
    }
    return null;
  }

  const freq = result.frequency;

  // 中位数滤波
  state.freqHistory.push(freq);
  if (state.freqHistory.length > state.MEDIAN_WINDOW) state.freqHistory.shift();

  let smoothFreq = freq;
  if (state.freqHistory.length >= 3) {
    smoothFreq = pitch.medianOfBuffer(state.freqHistory);
  }

  const cents = pitch.calcCents(smoothFreq, currentInfo.frequency);
  const angle = pitch.centsToAngle(cents);

  state.drawAngle = pitch.smoothEMA(angle, state.drawAngle, 0.3);
  state.smoothAngle = state.drawAngle;

  const isMatched = Math.abs(cents) < 5;
  const centStr = (cents > 0 ? '+' : '') + cents.toFixed(1) + '\u00A2';

  let statusClass, statusText;
  if (isMatched) {
    statusClass = 'tuned';
    statusText = '\u2705 音准 稳住...';
    state.stableCount++;
  } else if (cents < -5) {
    statusClass = 'flat';
    statusText = '\u4F4E \u2191 \u8C03\u7D27';
    state.stableCount = 0;
  } else if (cents > 5) {
    statusClass = 'sharp';
    statusText = '\u9AD8 \u2193 \u8C03\u677E';
    state.stableCount = 0;
  } else {
    statusClass = 'near';
    statusText = '\u63A5\u8FD1 \u2713';
    state.stableCount = 0;
  }

  const isDone = isMatched && state.stableCount >= state.STABLE_THRESHOLD;

  return {
    statusClass,
    statusText,
    freqDisplay: smoothFreq.toFixed(1),
    noteDisplay: pitch.freqToNote(smoothFreq).name,
    centsDisplay: centStr,
    isDone,
  };
}

/**
 * 当前弦调准完成：重置状态，返回下一弦信息
 * @param {import('./tunerStateMachine').TunerState} state - 状态机
 * @param {number} currentIndex - 当前弦索引 (0-5)
 * @param {Object[]} tuningOrder - 调弦顺序数组
 * @returns {Object} {nextIndex, nextInfo, isComplete}
 */
function advanceString(state, currentIndex, tuningOrder) {
  state.stableCount = 0;
  state.freqHistory = [];
  state.drawAngle = 0;
  state.smoothAngle = null;

  if (currentIndex >= 5) {
    return { nextIndex: currentIndex, nextInfo: null, isComplete: true };
  }

  const nextIdx = currentIndex + 1;
  return {
    nextIndex: nextIdx,
    nextInfo: tuningOrder[nextIdx],
    isComplete: false,
  };
}

module.exports = {
  createTunerState,
  processPitch,
  advanceString,
};
