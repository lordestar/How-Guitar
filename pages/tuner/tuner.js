var pitch = require('../../utils/pitch');
var tuningPresets = require('../../utils/tuningPresets');

Page({
  data: {
    showPrivacy: true,
    showPermTip: false,
    showComplete: false,

    tuningOrder: pitch.STANDARD_TUNING,
    currentIndex: 0,
    currentInfo: pitch.STANDARD_TUNING[0],

    currentTuningId: 'standard',
    currentTuningName: '标准调弦',
    tuningList: [],
    showTuningPanel: false,

    statusClass: 'waiting',
    statusText: '请拨动第6弦',
    freqDisplay: '---',
    noteDisplay: '',
    centsDisplay: '',
  },

  recMgr: null,
  isRunning: false,
  canvasCtx: null,
  _currentAngle: 0,

  frameBuffer: [],
  TARGET_FRAMES: 3,
  SAMPLE_RATE: 44100,

  freqHistory: [],
  MEDIAN_WINDOW: 7,

  smoothAngle: null,

  stableCount: 0,
  STABLE_THRESHOLD: 10,

  noiseGateOn: false,
  lastValidRms: 0,

  lastDetectMs: 0,
  pluckTimer: null,

  drawTimer: null,
  drawAngle: 0,

  onLoad: function () {
    this.initCanvas();
    this.loadTuningList();
    var lastTuningId = wx.getStorageSync('lastTuningId') || 'standard';
    this.switchTuning(lastTuningId);
  },

  onUnload: function () {
    this.stopRec();
    if (this.drawTimer) { clearInterval(this.drawTimer); this.drawTimer = null; }
    if (this.pluckTimer) { clearInterval(this.pluckTimer); this.pluckTimer = null; }
  },

  loadTuningList: function () {
    var presets = tuningPresets.getAllPresets();
    var customList = wx.getStorageSync('customTunings') || [];
    var list = presets.map(function (t) {
      return { id: t.id, name: t.name, description: t.description, isCustom: false };
    });
    for (var i = 0; i < customList.length; i++) {
      list.push(customList[i]);
    }
    this.setData({ tuningList: list });
  },

  switchTuning: function (tuningId) {
    var preset = tuningPresets.getTuningById(tuningId);
    var customList = wx.getStorageSync('customTunings') || [];
    var customTuning = null;
    for (var i = 0; i < customList.length; i++) {
      if (customList[i].id === tuningId) { customTuning = customList[i]; break; }
    }
    var tuning = preset || customTuning;
    if (!tuning) {
      tuning = tuningPresets.getTuningById('standard');
      tuningId = 'standard';
    }
    wx.setStorageSync('lastTuningId', tuningId);
    this.setData({
      currentTuningId: tuningId,
      currentTuningName: tuning.name,
    });
    this.resetTuning(tuning.strings);
  },

  resetTuning: function (strings) {
    this.stableCount = 0;
    this.freqHistory = [];
    this.frameBuffer = [];
    this.drawAngle = 0;
    this._currentAngle = 0;
    this.smoothAngle = null;
    this.currentTuningStrings = strings;
    this.setData({
      tuningOrder: strings,
      currentIndex: 0,
      currentInfo: strings[0],
      statusClass: 'waiting',
      statusText: '请拨动第' + strings[0].string + '弦',
      freqDisplay: '---',
      noteDisplay: '',
      centsDisplay: '',
    });
    if (!this.isRunning) {
      this.startRec();
    }
  },

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

    var target = this.drawAngle || 0;
    this._currentAngle = (this._currentAngle || 0) + (target - (this._currentAngle || 0)) * 0.18;

    var state = this.data.statusClass;
    if (state === 'tuned') { ctx.shadowColor = 'rgba(76,175,80,0.25)'; ctx.shadowBlur = 20; }

    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A34'; ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath(); ctx.arc(cx, cy, R - 5, sA, eA);
    ctx.strokeStyle = '#2A2A50'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();

    for (var i = 0; i < 80; i++) {
      var t = i / 80, a = sA + t * (eA - sA), na = sA + (i + 1) / 80 * (eA - sA);
      var c = t < 0.15 ? '#FF7733' : t < 0.30 ? '#DDBB33' : t < 0.50 ? '#4CAF50' : t < 0.70 ? '#4CAF50' : t < 0.85 ? '#EE6644' : '#FF5555';
      ctx.beginPath(); ctx.arc(cx, cy, R - 5, a, na);
      ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.stroke();
    }

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

  startRec: function () {
    var self = this;
    try { self.recMgr = wx.getRecorderManager(); } catch (e) { return; }

    self.recMgr.onStart(function () { self.isRunning = true; });
    self.recMgr.onError(function (e) { console.error('[rec] ERROR', JSON.stringify(e)); });

    self.recMgr.onFrameRecorded(function (res) {
      if (!self.isRunning) return;

      try {
        var buf = res.frameBuffer;
        var int16 = new Int16Array(buf);
        var float32 = new Float32Array(int16.length);

        for (var i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768;
        }

        self.frameBuffer.push(float32);
        if (self.frameBuffer.length > self.TARGET_FRAMES) self.frameBuffer.shift();

        if (self.frameBuffer.length >= self.TARGET_FRAMES) {
          var total = 0;
          for (var j = 0; j < self.frameBuffer.length; j++) total += self.frameBuffer[j].length;
          var merged = new Float32Array(total);
          var off = 0;
          for (var k = 0; k < self.frameBuffer.length; k++) { merged.set(self.frameBuffer[k], off); off += self.frameBuffer[k].length; }

          var targetTunings = self.currentTuningStrings || self.data.tuningOrder;
          var result = pitch.detectPitch(merged, self.SAMPLE_RATE, targetTunings);
          self.onPitch(result, merged.length);
        }
      } catch (e) { console.error('[rec] frame err', e); }
    });

    self.recMgr.start({
      duration: 300000, sampleRate: 44100, numberOfChannels: 1,
      encodeBitRate: 64000, format: 'pcm', frameSize: 5,
    });

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

  onPitch: function (result, frameLen) {
    if (!this.isRunning) return;
    this.lastDetectMs = Date.now();

    if (!result || !result.frequency || result.confidence < 0.25) {
      if (this.smoothAngle !== null) {
        this.drawAngle = pitch.smoothEMA(0, this.drawAngle, 0.05);
        if (Math.abs(this.drawAngle) < 1) this.drawAngle = 0;
      }
      return;
    }

    var freq = result.frequency;
    var conf = result.confidence;

    this.freqHistory.push(freq);
    if (this.freqHistory.length > this.MEDIAN_WINDOW) this.freqHistory.shift();

    var smoothFreq = freq;
    if (this.freqHistory.length >= 3) {
      smoothFreq = pitch.medianOfBuffer(this.freqHistory);
    }

    var target = this.data.currentInfo;
    var cents = pitch.calcCents(smoothFreq, target.frequency);
    var angle = pitch.centsToAngle(cents);

    this.drawAngle = pitch.smoothEMA(angle, this.drawAngle, 0.30);
    this.smoothAngle = this.drawAngle;

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

    this.setData({
      statusClass: state,
      statusText: text,
      freqDisplay: smoothFreq.toFixed(1),
      noteDisplay: pitch.freqToNote(smoothFreq).name,
      centsDisplay: centStr,
    });

    if (isMatched && this.stableCount >= this.STABLE_THRESHOLD) {
      this.onStringDone();
    }
  },

  onStringDone: function () {
    this.stableCount = 0;
    this.freqHistory = [];
    this.frameBuffer = [];

    var idx = this.data.currentIndex;
    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}

    if (idx >= 5) {
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

  onToggleTuningPanel: function () {
    this.setData({ showTuningPanel: !this.data.showTuningPanel });
  },

  onSelectTuning: function (e) {
    var id = e.currentTarget.dataset.id;
    if (id === this.data.currentTuningId) {
      this.setData({ showTuningPanel: false });
      return;
    }
    this.setData({ showTuningPanel: false });
    this.switchTuning(id);
  },

  onAddCustom: function () {
    this.setData({ showTuningPanel: false });
    wx.navigateTo({ url: '/pages/tuner/custom-tuning/custom-tuning' });
  },

  onDeleteCustomTuning: function (e) {
    var id = e.currentTarget.dataset.id;
    var self = this;
    wx.showModal({
      title: '删除调弦',
      content: '确定要删除该自定义调弦吗？',
      success: function (res) {
        if (res.confirm) {
          var customList = wx.getStorageSync('customTunings') || [];
          var newList = [];
          for (var i = 0; i < customList.length; i++) {
            if (customList[i].id !== id) newList.push(customList[i]);
          }
          wx.setStorageSync('customTunings', newList);
          if (self.data.currentTuningId === id) {
            self.switchTuning('standard');
          }
          self.loadTuningList();
        }
      },
    });
  },

  noop: function () {},
});
