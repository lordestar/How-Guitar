// pages/index/index.js
const { getChordNotes } = require('../../utils/chordDatabase');
const { getChordFingerings } = require('../../utils/fretboard');

var CHORD_TYPE_NAMES = {
  'major': '大三', 'minor': '小三', 'm': '小三', '7': '属七',
  'maj7': '大七', 'm7': '小七', 'dim': '减三', 'aug': '增三',
  'sus2': '挂二', 'sus4': '挂四', 'm7b5': '半减七',
  '6': '大六', 'm6': '小六', 'add9': '加九',
  '9': '属九', 'm9': '小九', 'maj9': '大九', '7sus4': '属七挂四',
};

var ROOT_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

Page({
  data: {
    favoriteChords: [],
    darkMode: false,
  },

  onLoad() {
    var darkMode = wx.getStorageSync('darkMode') || false;
    this.setData({ darkMode: darkMode });
    this.syncNavBarColor(darkMode);
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
    var darkMode = wx.getStorageSync('darkMode') || false;
    if (darkMode !== this.data.darkMode) {
      this.setData({ darkMode: darkMode });
      this.syncNavBarColor(darkMode);
    }
  },

  loadFavorites: function () {
    var favKeys = wx.getStorageSync('favoriteChords') || [];
    var favoriteChords = [];
    for (var i = 0; i < favKeys.length; i++) {
      var parts = favKeys[i].split('_');
      var root = parts[0];
      var type = parts[1] || 'major';
      var chordName = root + (type === 'major' ? '' : type);
      var typeName = CHORD_TYPE_NAMES[type] || type;
      favoriteChords.push({
        key: favKeys[i],
        root: root,
        type: type,
        chordName: chordName,
        typeName: typeName,
      });
    }
    this.setData({ favoriteChords: favoriteChords });
  },

  onToggleDarkMode: function () {
    var newMode = !this.data.darkMode;
    this.setData({ darkMode: newMode });
    wx.setStorageSync('darkMode', newMode);
    this.syncNavBarColor(newMode);
  },

  syncNavBarColor: function (isDark) {
    wx.setNavigationBarColor({
      frontColor: isDark ? '#ffffff' : '#000000',
      backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
    });
  },

  // 跳转到和弦查询页面（原本的首页全套功能）
  onGoChord: function () {
    wx.navigateTo({
      url: '/pages/chord/chord',
    });
  },

  // 跳转到调音器页面
  onGoTuner: function () {
    wx.navigateTo({
      url: '/pages/tuner/tuner',
    });
  },

  onSelectFavorite: function (e) {
    var key = e.currentTarget.dataset.key;
    var parts = key.split('_');
    var root = parts[0];
    var type = parts[1] || 'major';
    wx.setStorageSync('selectedFavorite', { root: root, type: type });
    wx.navigateTo({
      url: '/pages/chord/chord',
    });
  },
});
