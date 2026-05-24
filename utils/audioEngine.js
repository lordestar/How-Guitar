// ============ utils/audioEngine.js ============
// 和弦发声合成引擎 — 使用 Karplus-Strong 算法模拟吉他拨弦
// 纯计算合成，无需任何音频文件

// 标准音 A4 = 440Hz，12 音平均律
var NOTE_FREQUENCIES = {};
(function () {
  var noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var A4_SEMITONE = 69;
  for (var octave = 2; octave <= 6; octave++) {
    for (var ni = 0; ni < 12; ni++) {
      var semitone = A4_SEMITONE + (octave - 4) * 12 + (ni - 9);
      NOTE_FREQUENCIES[noteNames[ni] + octave] = 440 * Math.pow(2, (semitone - 69) / 12);
    }
  }
})();

function noteToFrequency(note) {
  if (!note) return 0;
  for (var oct = 5; oct >= 3; oct--) {
    var key = note + oct;
    if (NOTE_FREQUENCIES[key]) return NOTE_FREQUENCIES[key];
  }
  return 261.63;
}

// 获取当前指法的所有发声音符
function getSoundingNotes(strings) {
  var notes = [];
  var openNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
  var openNoteValues = [4, 9, 2, 7, 11, 4];
  var rootNoteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (var i = 0; i < 6; i++) {
    var st = strings[i];
    if (st.fret === 'x' || st.fret === null) continue;
    var fret = parseInt(st.fret, 10);
    if (isNaN(fret)) continue;

    if (fret === 0) {
      notes.push({ string: i, note: openNotes[i], frequency: noteToFrequency(openNotes[i]) });
    } else {
      var noteValue = (openNoteValues[i] + fret) % 12;
      var noteName = rootNoteNames[noteValue];
      notes.push({ string: i, note: noteName, frequency: noteToFrequency(noteName) });
    }
  }
  return notes;
}

// ─── Karplus-Strong 核心算法 ───
// 模拟吉他弦的拨弦振动，生成一个 AudioBuffer
function generatePluckBuffer(audioCtx, frequency, duration) {
  var sampleRate = audioCtx.sampleRate;
  var bufferSize = Math.floor(sampleRate * duration);
  var buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  var data = buffer.getChannelData(0);

  // 延迟线长度 = 一个周期的样本数
  var N = Math.max(2, Math.floor(sampleRate / frequency));

  // 1. 初始化：前 N 个样本为白噪声（模拟拨弦扰动）
  for (var i = 0; i < N; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.45;
  }

  // 2. 四点平均 Karplus-Strong 递推（模拟弦振动 + 衰减）
  //    y[n] = (y[n-N] + y[n-N+1]) * 0.5 * 衰减因子
  //    衰减因子略小于1产生持续衰减，接近吉他的特性
  var decayBase = 0.496;
  for (var i2 = N; i2 < bufferSize; i2++) {
    data[i2] = (data[i2 - N] + data[i2 - N + 1]) * decayBase;
  }

  // 3. 指数包络，使结尾更平滑（模拟琴弦能量逐渐消失）
  var envEnd = Math.exp(-3.8);
  for (var i3 = 0; i3 < bufferSize; i3++) {
    var t = i3 / bufferSize;
    var envelope = Math.exp(-3.8 * t);
    data[i3] *= envelope;
  }

  return buffer;
}

// 生成带"箱体感"的滤波版本的拨弦音
// 添加一个简单的共振峰滤波，让声音更温暖
function generatePluckBufferWarm(audioCtx, frequency, duration) {
  var sampleRate = audioCtx.sampleRate;
  var bufferSize = Math.floor(sampleRate * duration);
  var buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  var data = buffer.getChannelData(0);

  var N = Math.max(2, Math.floor(sampleRate / frequency));

  // 初始化：白噪声
  for (var i = 0; i < N; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.45;
  }

  // 衰减递推
  for (var i2 = N; i2 < bufferSize; i2++) {
    data[i2] = (data[i2 - N] + data[i2 - N + 1]) * 0.496;
  }

  // 平滑包络
  for (var i3 = 0; i3 < bufferSize; i3++) {
    var t = i3 / bufferSize;
    data[i3] *= Math.exp(-3.8 * t);
  }

  // 简单的箱体滤波（一阶低通，模拟木质共鸣吸收高频）
  var prev = 0;
  var filterCoeff = Math.min(0.5, 200 / frequency);
  for (var i4 = 0; i4 < bufferSize; i4++) {
    prev = data[i4] * (1 - filterCoeff) + prev * filterCoeff;
    data[i4] = prev;
  }

  return buffer;
}

// ─── 播放控制 ───

var audioContext = null;
var activeSources = [];
var playTimer = null;

function getAudioContext() {
  if (audioContext) return audioContext;
  try {
    audioContext = wx.createWebAudioContext();
  } catch (e) {
    return null;
  }
  return audioContext;
}

function playChord(strings, onEnd) {
  var ctx = getAudioContext();
  if (!ctx) {
    wx.showToast({ title: '当前环境不支持播放', icon: 'none' });
    if (onEnd) onEnd();
    return;
  }

  // 先停止之前的播放
  stopAllInternal(ctx);

  var notes = getSoundingNotes(strings);
  if (notes.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  var duration = 2.5;

  // 为每个音符生成 Karplus-Strong bufffer
  for (var i = 0; i < notes.length; i++) {
    var freq = notes[i].frequency;
    if (freq <= 0) continue;

    // 用 warm 版本生成 buffer
    var buffer = generatePluckBufferWarm(ctx, freq, duration);

    // 创建 AudioBufferSourceNode
    var source = ctx.createBufferSource();
    source.buffer = buffer;

    // 各弦音量（低音弦稍轻，高音弦稍重）
    var vol = 0.35 + (notes[i].string / 6) * 0.25;

    // 每个音符独立增益
    var gain = ctx.createGain();
    gain.gain.value = vol;
    source.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
    activeSources.push(source);
  }

  // 定时停止
  clearTimeout(playTimer);
  playTimer = setTimeout(function () {
    stopAllSources();
    if (onEnd) onEnd();
  }, Math.round(duration * 1000) + 100);
}

function stopAllInternal(ctx) {
  clearTimeout(playTimer);
  playTimer = null;
  for (var i = activeSources.length - 1; i >= 0; i--) {
    try {
      activeSources[i].stop();
    } catch (e) { /* already stopped */ }
  }
  activeSources = [];
}

function stopAllSources() {
  clearTimeout(playTimer);
  playTimer = null;
  for (var i = activeSources.length - 1; i >= 0; i--) {
    try {
      activeSources[i].stop();
    } catch (e) { /* already stopped */ }
  }
  activeSources = [];
}

function stopAll() {
  stopAllSources();
  if (audioContext && audioContext.state !== 'closed') {
    try { audioContext.close(); } catch (e) {}
    audioContext = null;
  }
}

module.exports = {
  playChord: playChord,
  stopAll: stopAll,
  getSoundingNotes: getSoundingNotes,
};
