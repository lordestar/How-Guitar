// pages/result/result.js
var SHORT_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
var FRET_PIXEL_WIDTH = 64;
var chordExpl = require('../../utils/chordExplanations');
var audioEngine = require('../../utils/audioEngine');

Page({
  data: {
    chordName: '',
    chordNotes: '',
    chordRoot: '',
    chordType: '',
    maxFret: 5,
    fingerings: [],
    totalCount: 0,
    currentIndex: 0,
    currentFingering: null,
    stringDetails: [],
    canvasWidth: 350,
    canvasHeight: 280,
    saving: false,
    chordInfo: null,

    // 暗色模式
    darkMode: false,

    // 收藏
    isFavorited: false,
    favoriteKey: '',

    // 音频
    isPlaying: false,
  },

  onLoad: function () {
    var darkMode = wx.getStorageSync('darkMode') || false;
    this.setData({ darkMode: darkMode });
    this.syncNavBarColor(darkMode);

    var resultData = wx.getStorageSync('currentFingeringResult');
    if (!resultData) {
      wx.showToast({ title: '数据异常，请返回重试', icon: 'none' });
      return;
    }

    var fingerings = resultData.fingerings || [];
    var maxFret = this.guessMaxFret(fingerings);
    var cHeight = maxFret >= 10 ? 290 : 270;
    var cWidth = (maxFret + 1) * FRET_PIXEL_WIDTH + 24;

    var chordRoot = resultData.root || '';
    var chordType = resultData.type || 'major';
    var chordInfo = chordExpl.getChordExplanation(chordRoot, chordType);

    // 收藏key: "C_major"
    var favoriteKey = chordRoot + '_' + chordType;

    // 检查是否已收藏
    var favList = wx.getStorageSync('favoriteChords') || [];
    var isFavorited = favList.indexOf(favoriteKey) >= 0;

    this.setData(
      {
        chordName: resultData.chordName,
        chordNotes: resultData.chordNotes ? resultData.chordNotes.join(' · ') : '',
        chordRoot: chordRoot,
        chordType: chordType,
        maxFret: maxFret,
        fingerings: fingerings,
        totalCount: fingerings.length,
        canvasWidth: cWidth,
        canvasHeight: cHeight,
        chordInfo: chordInfo,
        favoriteKey: favoriteKey,
        isFavorited: isFavorited,
      },
      function () {
        this.showFingering(0);
      }
    );
  },

  onUnload: function () {
    audioEngine.stopAll();
  },

  onShow: function () {
    // 每次显示时同步暗色模式状态
    var darkMode = wx.getStorageSync('darkMode') || false;
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

  guessMaxFret: function (fingerings) {
    var maxNeeded = 5;
    for (var i = 0; i < fingerings.length; i++) {
      var strings = fingerings[i].strings;
      if (!strings) continue;
      for (var s = 0; s < 6; s++) {
        var fret = parseInt(strings[s].fret, 10);
        if (!isNaN(fret) && fret > maxNeeded) {
          maxNeeded = fret;
        }
      }
    }
    return maxNeeded < 5 ? 5 : maxNeeded;
  },

  showFingering: function (index) {
    var fingerings = this.data.fingerings;
    if (!fingerings || fingerings.length === 0) return;
    if (index < 0) index = 0;
    if (index >= fingerings.length) index = fingerings.length - 1;

    var fingering = fingerings[index];
    var details = [];
    var strings = fingering.strings;
    if (strings) {
      for (var i = 5; i >= 0; i--) {
        var st = strings[i];
        var isChordNote = st.note !== null;
        var isMuted = st.fret === 'x';
        var isOpen = st.fret === 0 || st.fret === '0';
        details.push({
          shortName: SHORT_NAMES[5 - i],
          indicator: isMuted ? '✕' : isOpen ? '○' : '',
          indicatorClass: isMuted
            ? 'indicator-muted'
            : isOpen
              ? 'indicator-open'
              : 'indicator-none',
          noteDisplay: isChordNote ? st.note : '—',
          noteColor: isChordNote ? 'chord-note' : 'muted',
          fretDisplay: st.fret === 'x' ? '✕' : String(st.fret),
          statusDisplay: isMuted ? '不弹' : isOpen ? '空弦' : '按' + st.fret + '品',
        });
      }
    }

    this.setData({
      currentIndex: index,
      currentFingering: fingering,
      stringDetails: details,
      isPlaying: false,
    });
  },

  prevFingering: function () {
    this.showFingering(this.data.currentIndex - 1);
  },

  nextFingering: function () {
    this.showFingering(this.data.currentIndex + 1);
  },

  onFretboardReady: function () {},

  // === 音频播放 ===
  onPlayChord: function () {
    if (this.data.isPlaying) {
      audioEngine.stopAll();
      this.setData({ isPlaying: false });
      return;
    }

    var fingering = this.data.currentFingering;
    if (!fingering || !fingering.strings) return;

    this.setData({ isPlaying: true });
    audioEngine.playChord(
      fingering.strings,
      function () {
        // 播放结束回调
        this.setData({ isPlaying: false });
      }.bind(this)
    );
  },

  // === 收藏功能 ===
  onToggleFavorite: function () {
    var favList = wx.getStorageSync('favoriteChords') || [];
    var key = this.data.favoriteKey;
    var idx = favList.indexOf(key);

    if (idx >= 0) {
      // 取消收藏
      favList.splice(idx, 1);
      this.setData({ isFavorited: false });
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      // 添加收藏
      favList.push(key);
      this.setData({ isFavorited: true });
      wx.showToast({ title: '已收藏 ♥', icon: 'success' });
    }

    wx.setStorageSync('favoriteChords', favList);
  },

  // === 保存图片 ===
  onSaveImage: function () {
    var self = this;
    self.setData({ saving: true });
    var viewer = this.selectComponent('#fretboardViewer');
    if (viewer && viewer.saveToAlbum) {
      viewer
        .saveToAlbum()
        .then(function () {
          self.setData({ saving: false });
        })
        .catch(function () {
          self.setData({ saving: false });
        });
    } else {
      wx.showToast({ title: '组件未就绪', icon: 'none' });
      self.setData({ saving: false });
    }
  },
});
