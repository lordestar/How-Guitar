// pages/index/index.js
const { CHORD_TYPE_NAMES } = require('../../utils/chordDatabase');
const { getChordFingerings } = require('../../utils/fretboard');

Page({
  data: {
    favoriteChords: [],
    darkMode: false,
  },

  onLoad() {
    const darkMode = wx.getStorageSync('darkMode') || false;
    this.setData({ darkMode: darkMode });
    this.syncNavBarColor(darkMode);
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
    const darkMode = wx.getStorageSync('darkMode') || false;
    if (darkMode !== this.data.darkMode) {
      this.setData({ darkMode: darkMode });
      this.syncNavBarColor(darkMode);
    }
  },

  loadFavorites: function () {
    const favKeys = wx.getStorageSync('favoriteChords') || [];
    const favoriteChords = [];
    for (let i = 0; i < favKeys.length; i++) {
      const parts = favKeys[i].split('_');
      const root = parts[0];
      const type = parts[1] || 'major';
      const chordName = root + (type === 'major' ? '' : type);
      const typeName = CHORD_TYPE_NAMES[type] || type;
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
    const newMode = !this.data.darkMode;
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
    const key = e.currentTarget.dataset.key;
    const parts = key.split('_');
    const root = parts[0];
    const type = parts[1] || 'major';
    getApp().globalData.selectedFavorite = { root: root, type: type };
    wx.navigateTo({
      url: '/pages/chord/chord',
    });
  },
});
