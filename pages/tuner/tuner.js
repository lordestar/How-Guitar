// pages/tuner/tuner.js
// 吉他调音器 v3 — 稳定版
// 修复：滑动中位数滤波 + 连续帧稳定判定 + 噪声门限 + 指针缓动
// 关键：frameSize: 5（5KB）确保 onFrameRecorded 触发

var pitch = require('../../utils/pitch');

Page({
  data: {
    showPrivacy: true,
    showPermTip: false,
    showComplete: false,

    tuningOrder: pitch.STANDARD_TUNING,
    currentIndex: 0,
    currentInfo: pitch.STANDARD_TUNING[0],

    statusClass: 'waiting',
    statusText: '请拨动第6弦',
    freqDisplay: '---',
    noteDisplay: '',
    centsDisplay: '',
  },

  // ─── 模块变量 ───
  recMgr: null,
  isRunning: false,
  canvasCtx: null,
  _currentAngle: 0,

  // 帧管理
  frameBuffer: [],
  TARGET_FRAMES: 3,
  SAMPLE_RATE: 44100,

  // 滑动中位数缓冲（最近 7 帧的检测频率）
  freqHistory: [],
  MEDIAN_WINDOW: 7,

  // 平滑
  smoothAngle: null,

  // 稳定性计数（连续 |cents| < 5 的帧数）
  stableCount: 0,
  STABLE_THRESHOLD: 10,  // 约 1.5 秒

  // 噪声门限滞后
  noiseGateOn: false,
  lastValidRms: 0,

  // 拨弦提示计时
  lastDetectMs: 0,
  pluckTimer: null,

  // Canvas 绘制
  drawTimer: null,
  drawAngle: 0,

  // ─── 生命周期 ───
  onLoad: function () {
    console.log('[tuner] v3 loaded');
    this.initCanvas();
  },

  onUnload: function () {
    console.log('[tuner] unload');
    this.stopRec();
    if (this.drawTimer) { clearInterval(this.drawTimer); this.drawTimer = null; }
    if (this.pluckTimer) { clearInterval(this.pluckTimer); this.pluckTimer = null; }
  },

  // ═════════════════════════════════════════
  //  Canvas
  // ═════════════════════════════════════════
  initCanvas: function () {
    var self = this;
    wx.createSelectorQuery().select('#gaugeCanvas').fields({ node: true, size: true }).exec(function (r) {
      if (!r || !r[0]) { setTimeout(function () { self.initCanvas(); }, 300); return; }
      var canvas = r[0].node;
      var dpr = wx.getSystemInfoSync().pixelRatio || 2;
      canvas.width = r[0].width * dpr;
      canvas.height = r[0].height * dpr;
      self.canvasCtx = canvas.getContext('2d');
      self.canvasCtx.scale(dpr, dpr);
      self.drawTimer = setInterval(function () { self.drawGauge(); }, 50);
    });
  },

  drawGauge: function () {
    var ctx = this.canvasCtx;
    if (!ctx) return;
    var sys = wx.getSystemInfoSync();
    var rpx = sys.windowWidth / 750;
    var W = 560 * rpx, H = 560 * rpx;
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 18;
    var sA = -Math.PI * 0.75, eA = Math.PI * 0.75;

    ctx.clearRect(0, 0, W, H);

    // 指针缓动
    var target = this.drawAngle || 0;
    this._currentAngle = (this._currentAngle || 0) + (target - (this._currentAngle || 0)) * 0.18;

    var state = this.data.statusClass;
    if (state === 'tuned') { ctx.shadowColor = 'rgba(76,175,80,0.25)'; ctx.shadowBlur = 20; }

    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A34'; ctx.fill();
    ctx.shadowBlur = 0;

    // 轨道
    ctx.beginPath(); ctx.arc(cx, cy, R - 5, sA, eA);
    ctx.strokeStyle = '#2A2A50'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();

    // 渐变弧
    for (var i = 0; i < 80; i++) {
      var t = i / 80, a = sA + t * (eA - sA), na = sA + (i + 1) / 80 * (eA - sA);
      var c = t < 0.15 ? '#FF7733' : t < 0.30 ? '#DDBB33' : t < 0.50 ? '#4CAF50' : t < 0.70 ? '#4CAF50' : t < 0.85 ? '#EE6644' : '#FF5555';
      ctx.beginPath(); ctx.arc(cx, cy, R - 5, a, na);
      ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.stroke();
    }

    // 刻度
    for (var ti = 0; ti < 21; ti++) {
      var tv = ti / 20, aa = sA + tv * (eA - sA);
      var isC = ti === 10, isM = ti % 5 === 0;
      var tLen = isC ? 14 : (isM ? 10 : 6), tW = isC ? 4 : (isM ? 3 : 2);
      var ir = R - 11 - tLen;
      ctx.beginPath();
      ctx.moveTo(cx + (R - 11) * Math.cos(aa), cy + (R - 11) * Math.sin(aa));
      ctx.lineTo(cx + ir * Math.cos(aa), cy + ir * Math.sin(aa));
      ctx.strokeStyle = isC ? '#4CAF50' : '#3A3A5A'; ctx.lineWidth = tW; ctx.lineCap = 'round'; ctx.stroke();
    }

    // 指针
    var ptr = this._currentAngle || 0;
    var ptrR = sA + ((ptr + 90) / 180) * (eA - sA);
    ptrR = Math.max(sA, Math.min(eA, ptrR));
    var pLen = R - 26, px = cx + pLen * Math.cos(ptrR), py = cy + pLen * Math.sin(ptrR);

    ctx.shadowColor = state === 'tuned' ? 'rgba(76,175,80,0.3)' : 'rgba(255,215,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
    ctx.strokeStyle = state === 'tuned' ? '#4CAF50' : '#FFD700'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 8 * Math.cos(ptrR - 0.15), py - 8 * Math.sin(ptrR - 0.15));
    ctx.lineTo(px - 8 * Math.cos(ptrR + 0.15), py - 8 * Math.sin(ptrR + 0.15));
    ctx.closePath();
    ctx.fillStyle = state === 'tuned' ? '#4CAF50' : '#FFD700'; ctx.fill();

    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = state === 'tuned' ? '#4CAF50' : '#FFD700'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A34'; ctx.fill();

    // 文字
    ctx.fillStyle = '#A09888'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('第' + this.data.currentInfo.string + '弦', cx, cy + R - 38);
    ctx.fillStyle = '#706868'; ctx.font = '12px sans-serif';
    ctx.fillText(this.data.currentInfo.frequency + ' Hz', cx, cy + R - 24);
    if (this.data.centsDisplay) {
      var cc = '#555';
      if (state === 'tuned') cc = '#4CAF50';
      else if (state === 'flat') cc = '#FF8844';
      else if (state === 'sharp') cc = '#FF6B6B';
      ctx.fillStyle = cc; ctx.font = 'bold 18px sans-serif';
      ctx.fillText(this.data.centsDisplay, cx, cy - R + 45);
    }
  },

  // ═════════════════════════════════════════
  //  隐私 & 权限
  // ═════════════════════════════════════════
  onPrivacyAgree: function () {
    this.setData({ showPrivacy: false });
    this.requestMic();
  },
  onPrivacyDeny: function () { wx.showToast({ title: '需要同意', icon: 'none' }); },

  requestMic: function () {
    var self = this;
    wx.authorize({
      scope: 'scope.record',
      success: function () {
        self.setData({ showPermTip: false });
        self.startRec();
      },
      fail: function () {
        wx.getSetting({
          success: function (r) {
            self.setData({ showPermTip: r.authSetting['scope.record'] === false });
          },
        });
      },
    });
  },

  onOpenSettings: function () {
    var self = this;
    wx.openSetting({
      success: function (r) {
        if (r.authSetting['scope.record']) { self.setData({ showPermTip: false }); self.startRec(); }
      },
    });
  },

  // ═════════════════════════════════════════
  //  录音（frameSize: 5 KB 是触发 onFrameRecorded 的关键）
  // ═════════════════════════════════════════
  startRec: function () {
    var self = this;
    try { self.recMgr = wx.getRecorderManager(); } catch (e) { return; }

    self.recMgr.onStart(function () { self.isRunning = true; console.log('[rec] STARTED'); });
    self.recMgr.onError(function (e) { console.error('[rec] ERROR', JSON.stringify(e)); });

    self.recMgr.onFrameRecorded(function (res) {
      if (!self.isRunning) return;

      try {
        var buf = res.frameBuffer;
        var int16 = new Int16Array(buf);
        var float32 = new Float32Array(int16.length);

        // 计算峰值音量
        var peak = 0;
        for (var i = 0; i < int16.length; i++) {
          var v = int16[i] / 32768;
          float32[i] = v;
          var a = v < 0 ? -v : v;
          if (a > peak) peak = a;
        }

        // 累积帧缓冲
        self.frameBuffer.push(float32);
        if (self.frameBuffer.length > self.TARGET_FRAMES) self.frameBuffer.shift();

        if (self.frameBuffer.length >= self.TARGET_FRAMES) {
          var total = 0;
          for (var j = 0; j < self.frameBuffer.length; j++) total += self.frameBuffer[j].length;
          var merged = new Float32Array(total);
          var off = 0;
          for (var k = 0; k < self.frameBuffer.length; k++) { merged.set(self.frameBuffer[k], off); off += self.frameBuffer[k].length; }

          // 音高检测
          var result = pitch.detectPitch(merged, self.SAMPLE_RATE);
          self.onPitch(result, merged.length);
        }
      } catch (e) { console.error('[rec] frame err', e); }
    });

    self.recMgr.start({
      duration: 300000, sampleRate: 44100, numberOfChannels: 1,
      encodeBitRate: 64000, format: 'pcm', frameSize: 5,
    });

    // 拨弦提示
    self.lastDetectMs = Date.now();
    self.pluckTimer = setInterval(function () {
      if (!self.isRunning) { clearInterval(self.pluckTimer); return; }
      if (!self.data.freqDisplay || self.data.freqDisplay === '---') {
        if (Date.now() - self.lastDetectMs > 3000) {
          if (self.data.statusClass !== 'waiting') {
            self.setData({ statusClass: 'waiting', statusText: '请拨动第' + self.data.currentInfo.string + '弦', freqDisplay: '---', noteDisplay: '', centsDisplay: '' });
          }
        }
      }
    }, 2000);
  },

  stopRec: function () {
    this.isRunning = false;
    this.frameBuffer = [];
    this.freqHistory = [];
    this.smoothAngle = null;
    try { if (this.recMgr) this.recMgr.stop(); } catch (e) {}
  },

  // ═════════════════════════════════════════
  //  音高结果处理（核心修复）
  // ═════════════════════════════════════════
  onPitch: function (result, frameLen) {
    if (!this.isRunning) return;
    this.lastDetectMs = Date.now();

    if (!result || !result.frequency || result.confidence < 0.25) {
      // 没检测到声音或置信度太低
      if (this.smoothAngle !== null) {
        this.drawAngle = pitch.smoothEMA(0, this.drawAngle, 0.05);
        if (Math.abs(this.drawAngle) < 1) this.drawAngle = 0;
      }
      return;
    }

    var freq = result.frequency;
    var conf = result.confidence;

    // ── 滑动中位数滤波 ──
    this.freqHistory.push(freq);
    if (this.freqHistory.length > this.MEDIAN_WINDOW) this.freqHistory.shift();

    var smoothFreq = freq;
    if (this.freqHistory.length >= 3) {
      smoothFreq = pitch.medianOfBuffer(this.freqHistory);
    }

    // ── 计算偏差 ──
    var target = this.data.currentInfo;
    var cents = pitch.calcCents(smoothFreq, target.frequency);
    var angle = pitch.centsToAngle(cents);

    // ── EMA 平滑指针 ──
    this.drawAngle = pitch.smoothEMA(angle, this.drawAngle, 0.30);
    this.smoothAngle = this.drawAngle;

    // ── 判定状态 ──
    var state = '', text = '';
    var centStr = (cents > 0 ? '+' : '') + cents.toFixed(1) + '¢';
    var isMatched = Math.abs(cents) < 5;

    if (isMatched) {
      state = 'tuned';
      text = '✅ 音准 稳住...';
      this.stableCount++;
    } else if (cents < -5) {
      state = 'flat';
      text = '偏低 ↑ 调紧';
      this.stableCount = 0;
    } else if (cents > 5) {
      state = 'sharp';
      text = '偏高 ↓ 调松';
      this.stableCount = 0;
    } else {
      state = 'near';
      text = '接近 ✓';
      this.stableCount = 0;
    }

    // 日志输出
    console.log('[tuner] raw=' + freq.toFixed(1) + ' smooth=' + smoothFreq.toFixed(1)
      + ' target=' + target.frequency + 'Hz cents=' + cents.toFixed(1)
      + ' stable=' + this.stableCount + '/' + this.STABLE_THRESHOLD
      + ' conf=' + conf.toFixed(2));

    // ── 更新 UI ──
    this.setData({
      statusClass: state,
      statusText: text,
      freqDisplay: smoothFreq.toFixed(1),
      noteDisplay: pitch.freqToNote(smoothFreq).name,
      centsDisplay: centStr,
    });

    // ── 稳定后自动切弦 ──
    if (isMatched && this.stableCount >= this.STABLE_THRESHOLD) {
      this.onStringDone();
    }
  },

  // ═════════════════════════════════════════
  //  弦调准处理
  // ═════════════════════════════════════════
  onStringDone: function () {
    this.stableCount = 0;
    this.freqHistory = [];
    this.frameBuffer = [];

    var idx = this.data.currentIndex;
    console.log('[tuner] String ' + this.data.currentInfo.string + ' TUNED!');

    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}

    if (idx >= 5) {
      console.log('[tuner] ALL STRINGS DONE!');
      setTimeout(function () { try { wx.vibrateShort({ type: 'medium' }); } catch (e) {} }, 300);
      this.setData({ showComplete: true });
      return;
    }

    var nextIdx = idx + 1;
    this.setData({
      currentIndex: nextIdx,
      currentInfo: this.data.tuningOrder[nextIdx],
      statusClass: 'waiting',
      statusText: '请拨动第' + this.data.tuningOrder[nextIdx].string + '弦',
      freqDisplay: '---',
      noteDisplay: '',
      centsDisplay: '',
    });
    this.drawAngle = 0;
    this._currentAngle = 0;
    this.smoothAngle = null;
  },

  // ═════════════════════════════════════════
  //  用户交互
  // ═════════════════════════════════════════
  onTapString: function (e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10);
    if (idx === this.data.currentIndex) return;
    this.resetState(idx);
  },

  onRestart: function () {
    this.resetState(0);
  },

  resetState: function (idx) {
    this.stableCount = 0;
    this.freqHistory = [];
    this.frameBuffer = [];
    this.drawAngle = 0;
    this._currentAngle = 0;
    this.smoothAngle = null;
    this.setData({
      currentIndex: idx,
      currentInfo: this.data.tuningOrder[idx],
      statusClass: 'waiting',
      statusText: '请拨动第' + this.data.tuningOrder[idx].string + '弦',
      freqDisplay: '---',
      noteDisplay: '',
      centsDisplay: '',
    });
  },

  onCompleteClose: function () {
    this.setData({ showComplete: false });
    this.resetState(0);
  },
});
