// ============ utils/constants.js ============
// 全局常量定义 — 从各模块提取的魔法数字

// ---- audioEngine.js ----
const KS_DECAY_BASE = 0.496; // Karplus-Strong 衰减因子
const KS_ENVELOPE_RATE = 3.8; // 指数包络衰减率
const KS_NOISE_AMPLITUDE = 0.45; // 初始噪声幅度
const CHORD_DURATION_SEC = 2.5; // 和弦播放时长(秒)
const VOLUME_BASE = 0.35; // 音量基准（低音弦）
const VOLUME_RANGE = 0.25; // 音量范围（高音弦增量）
const FILTER_COEFF_SCALE = 200; // 箱体滤波系数缩放因子
const FILTER_COEFF_MAX = 0.5; // 箱体滤波系数上限

// ---- pitch.js ----
const RMS_THRESHOLD_ON = 0.008; // 噪声门限开启阈值
const RMS_THRESHOLD_OFF = 0.004; // 噪声门限关闭阈值
const PEAK_CORR_THRESHOLD = 0.25; // 自相关相关度阈值
const FREQ_MIN = 65; // 最小可检测频率(Hz) ≈ C2
const FREQ_MAX = 1100; // 最大可检测频率(Hz) ≈ C6
const AUTOCORR_SAMPLE_LIMIT = 1000; // 自相关计算样本上限
const PEAK_RELATIVE_THRESHOLD = 0.85; // 峰值相对阈值（取全局最大值85%以上的峰）
const PARABOLIC_SAMPLE_LIMIT = 500; // 抛物线插值样本上限

// ---- fretboard.js ----
const SEARCH_MAX_FRET = 14; // 指法搜索最大品数
const MAX_FRET_SPAN = 5; // 指法最大允许跨度（品）
const MAX_FINGERINGS = 20; // 返回指法数量上限

module.exports = {
  // audioEngine
  KS_DECAY_BASE,
  KS_ENVELOPE_RATE,
  KS_NOISE_AMPLITUDE,
  CHORD_DURATION_SEC,
  VOLUME_BASE,
  VOLUME_RANGE,
  FILTER_COEFF_SCALE,
  FILTER_COEFF_MAX,

  // pitch
  RMS_THRESHOLD_ON,
  RMS_THRESHOLD_OFF,
  PEAK_CORR_THRESHOLD,
  FREQ_MIN,
  FREQ_MAX,
  AUTOCORR_SAMPLE_LIMIT,
  PEAK_RELATIVE_THRESHOLD,
  PARABOLIC_SAMPLE_LIMIT,

  // fretboard
  SEARCH_MAX_FRET,
  MAX_FRET_SPAN,
  MAX_FINGERINGS,
};
