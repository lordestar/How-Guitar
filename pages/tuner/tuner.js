const pitch = require('../../utils/pitch');
const tuningPresets = require('../../utils/tuningPresets');
const { drawGauge: gaugeDraw } = require('../../utils/tunerGauge');
const { createTunerState, processPitch, advanceString } = require('../../utils/tunerStateMachine');

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
    autoSwitch: true,
    darkMode: false,

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
    const darkMode = wx.getStorageSync('darkMode') || false;
    this.setData({ darkMode: darkMode });
    this.syncNavBarColor(darkMode);
    this.initCanvas();
    this.loadTuningList();
    const lastTuningId = wx.getStorageSync('lastTuningId') || 'standard';
    this.switchTuning(lastTuningId);
  },

  onShow: function () {
    const darkMode = wx.getStorageSync('darkMode') || false;
    if (darkMode !== this.data.darkMode) {
      this.setData({ darkMode: darkMode });
      this.syncNavBarColor(darkMode);
    }
  },

  syncNavBarColor: function (isDark) {
    wx.setNavigationBarColor({
      frontColor: isDark ? '#ffffff' : '#000000',
      backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
    });
  },

  onUnload: function () {
    this.stopRec();
    if (this.drawTimer) {
      clearInterval(this.drawTimer);
      this.drawTimer = null;
    }
    if (this.pluckTimer) {
      clearInterval(this.pluckTimer);
      this.pluckTimer = null;
    }
  },

  loadTuningList: function () {
    const presets = tuningPresets.getAllPresets();
    const customList = wx.getStorageSync('customTunings') || [];
    const list = presets.map(function (t) {
      return { id: t.id, name: t.name, description: t.description, isCustom: false };
    });
    for (let i = 0; i < customList.length; i++) {
      list.push(customList[i]);
    }
    this.setData({ tuningList: list });
  },

  switchTuning: function (tuningId) {
    const preset = tuningPresets.getTuningById(tuningId);
    const customList = wx.getStorageSync('customTunings') || [];
    let customTuning = null;
    for (let i = 0; i < customList.length; i++) {
      if (customList[i].id === tuningId) {
        customTuning = customList[i];
        break;
      }
    }
    let tuning = preset || customTuning;
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
    const self = this;
    wx.createSelectorQuery()
      .select('#gaugeCanvas')
      .fields({ node: true, size: true })
      .exec(function (r) {
        if (!r || !r[0]) {
          setTimeout(function () {
            self.initCanvas();
          }, 300);
          return;
        }
        const canvas = r[0].node;
        const dpr = wx.getSystemInfoSync().pixelRatio || 2;
        canvas.width = r[0].width * dpr;
        canvas.height = r[0].height * dpr;
        self.canvasCtx = canvas.getContext('2d');
        self.canvasCtx.scale(dpr, dpr);
        self.tunerState = createTunerState();
        self.drawTimer = setInterval(function () {
          self.drawGauge();
        }, 50);
      });
  },

  drawGauge: function () {
    if (!this.canvasCtx) return;
    const gaugeState = {
      statusClass: this.data.statusClass,
      currentInfo: this.data.currentInfo,
      centsDisplay: this.data.centsDisplay,
    };
    this._currentAngle = gaugeDraw(this.canvasCtx, this.drawAngle, this._currentAngle, gaugeState);
    // Update textBaseline reset after gauge draw
    if (this.canvasCtx.textBaseline) this.canvasCtx.textBaseline = 'alphabetic';
  },

  onPrivacyAgree: function () {
    this.setData({ showPrivacy: false });
    this.requestMic();
  },
  onPrivacyDeny: function () {
    wx.showToast({ title: '需要同意', icon: 'none' });
  },

  requestMic: function () {
    const self = this;
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
    const self = this;
    wx.openSetting({
      success: function (r) {
        if (r.authSetting['scope.record']) {
          self.setData({ showPermTip: false });
          self.startRec();
        }
      },
    });
  },

  startRec: function () {
    const self = this;
    try {
      self.recMgr = wx.getRecorderManager();
    } catch (e) {
      return;
    }

    self.recMgr.onStart(function () {
      self.isRunning = true;
    });
    self.recMgr.onError(function (e) {
      console.error('[rec] ERROR', JSON.stringify(e));
    });

    self.recMgr.onFrameRecorded(function (res) {
      if (!self.isRunning) return;

      try {
        const buf = res.frameBuffer;
        const int16 = new Int16Array(buf);
        const float32 = new Float32Array(int16.length);

        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768;
        }

        self.frameBuffer.push(float32);
        if (self.frameBuffer.length > self.TARGET_FRAMES) self.frameBuffer.shift();

        if (self.frameBuffer.length >= self.TARGET_FRAMES) {
          let total = 0;
          for (let j = 0; j < self.frameBuffer.length; j++) total += self.frameBuffer[j].length;
          const merged = new Float32Array(total);
          let off = 0;
          for (let k = 0; k < self.frameBuffer.length; k++) {
            merged.set(self.frameBuffer[k], off);
            off += self.frameBuffer[k].length;
          }

          const targetTunings = self.currentTuningStrings || self.data.tuningOrder;
          const result = pitch.detectPitch(merged, self.SAMPLE_RATE, targetTunings);
          self.onPitch(result, merged.length);
        }
      } catch (e) {
        console.error('[rec] frame err', e);
      }
    });

    self.recMgr.start({
      duration: 300000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 64000,
      format: 'pcm',
      frameSize: 5,
    });

    self.lastDetectMs = Date.now();
    self.pluckTimer = setInterval(function () {
      if (!self.isRunning) {
        clearInterval(self.pluckTimer);
        return;
      }
      if (!self.data.freqDisplay || self.data.freqDisplay === '---') {
        if (Date.now() - self.lastDetectMs > 3000) {
          if (self.data.statusClass !== 'waiting') {
            self.setData({
              statusClass: 'waiting',
              statusText: '请拨动第' + self.data.currentInfo.string + '弦',
              freqDisplay: '---',
              noteDisplay: '',
              centsDisplay: '',
            });
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
    try {
      if (this.recMgr) this.recMgr.stop();
    } catch (e) {}
  },

  onPitch: function (result, frameLen) {
    if (!this.isRunning) return;
    this.lastDetectMs = Date.now();

    const pitchResult = processPitch(this.tunerState, result, this.data.currentInfo);
    if (!pitchResult) return;

    this.drawAngle = this.tunerState.drawAngle;
    this.smoothAngle = this.tunerState.smoothAngle;

    const { statusClass, statusText, freqDisplay, noteDisplay, centsDisplay, isDone } = pitchResult;

    this.setData({
      statusClass, statusText, freqDisplay, noteDisplay, centsDisplay,
    });

    if (isDone) {
      this.onStringDone();
    }
  },

  onStringDone: function () {
    const idx = this.data.currentIndex;
    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}

    // ?????????????? tuned ??
    if (!this.data.autoSwitch) {
      this.setData({
        statusClass: 'tuned',
        statusText: '\u2713 \u5DF2\u8C03\u51C6, \u70B9\u51FB\u4E0B\u4E00\u5F26',
      });
      return;
    }

    const { nextIndex, nextInfo, isComplete } = advanceString(this.tunerState, idx, this.data.tuningOrder);

    if (isComplete) {
      setTimeout(function () {
        try { wx.vibrateShort({ type: 'medium' }); } catch (e) {}
      }, 300);
      this.setData({ showComplete: true });
      return;
    }

    this._currentAngle = 0;
    this.drawAngle = 0;
    this.smoothAngle = null;
    this.setData({
      currentIndex: nextIndex,
      currentInfo: nextInfo,
      statusClass: 'waiting',
      statusText: nextInfo.string + '弦',
      freqDisplay: '---',
      noteDisplay: '',
      centsDisplay: '',
    });
  },

  onToggleAutoSwitch: function () {
    const next = !this.data.autoSwitch;
    this.setData({ autoSwitch: next });
    wx.showToast({
      title: next ? '自动切弦 · 开' : '手动切弦 · 关',
      icon: 'none',
      duration: 1200,
    });
  },

  onTapString: function (e) {
    const idx = parseInt(e.currentTarget.dataset.index, 10);
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
    const id = e.currentTarget.dataset.id;
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
    const id = e.currentTarget.dataset.id;
    const self = this;
    wx.showModal({
      title: '删除调弦',
      content: '确定要删除该自定义调弦吗？',
      success: function (res) {
        if (res.confirm) {
          const customList = wx.getStorageSync('customTunings') || [];
          const newList = [];
          for (let i = 0; i < customList.length; i++) {
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
