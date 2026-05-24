// pages/chord/chord.js
const { getChordNotes } = require('../../utils/chordDatabase');
const { getChordFingerings } = require('../../utils/fretboard');

Page({
  data: {
    rootNotes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    selectedRoot: 'C',
    selectedRootIndex: 0,

    chordTypes: [
      { key: 'major', name: '大三' },
      { key: 'minor', name: '小三' },
      { key: 'm', name: '小三(m)' },
      { key: '7', name: '属七' },
      { key: 'maj7', name: '大七' },
      { key: 'm7', name: '小七' },
      { key: 'dim', name: '减三' },
      { key: 'aug', name: '增三' },
      { key: 'sus2', name: '挂二' },
      { key: 'sus4', name: '挂四' },
      { key: 'm7b5', name: '半减七' },
      { key: '6', name: '大六' },
      { key: 'm6', name: '小六' },
      { key: 'add9', name: '加九' },
      { key: '9', name: '属九' },
      { key: 'm9', name: '小九' },
      { key: 'maj9', name: '大九' },
      { key: '7sus4', name: '属七挂四' },
    ],
    selectedTypeIndex: 0,

    maxFret: 5,

    previewNotes: '',
    previewNotesArray: [],
    errorMsg: '',
    isLoading: false,
    darkMode: false,
  },

  onLoad() {
    var darkMode = wx.getStorageSync('darkMode') || false;
    this.setData({ darkMode: darkMode });
    this.syncNavBarColor(darkMode);

    // 处理从首页收藏夹跳转过来的参数
    var fav = wx.getStorageSync('selectedFavorite');
    if (fav && fav.root) {
      var rootIdx = this.data.rootNotes.indexOf(fav.root);
      var typeIdx = -1;
      for (var i = 0; i < this.data.chordTypes.length; i++) {
        if (this.data.chordTypes[i].key === fav.type) { typeIdx = i; break; }
      }
      if (rootIdx >= 0 && typeIdx >= 0) {
        this.setData({
          selectedRootIndex: rootIdx,
          selectedRoot: fav.root,
          selectedTypeIndex: typeIdx,
        });
      }
      wx.removeStorageSync('selectedFavorite');
    }

    this.updatePreview();
  },

  onShow: function () {
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

  selectRoot: function(e) {
    var index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ selectedRoot: this.data.rootNotes[index], selectedRootIndex: index });
    this.updatePreview();
  },

  selectType: function(e) {
    var index = parseInt(e.currentTarget.dataset.index, 10);
    this.setData({ selectedTypeIndex: index });
    this.updatePreview();
  },

  onSetMaxFret: function(e) {
    var fret = parseInt(e.currentTarget.dataset.fret, 10);
    this.setData({ maxFret: fret });
  },

  updatePreview: function() {
    var root = this.data.selectedRoot;
    var type = this.data.chordTypes[this.data.selectedTypeIndex].key;
    var info = getChordNotes(root, type);
    if (info.error) {
      this.setData({ previewNotes: '', previewNotesArray: [], errorMsg: info.error });
    } else {
      this.setData({
        previewNotes: info.notes.join(' · '),
        previewNotesArray: info.notes,
        errorMsg: '',
      });
    }
  },

  onGenerate: function() {
    var root = this.data.selectedRoot;
    var type = this.data.chordTypes[this.data.selectedTypeIndex].key;
    var maxFret = this.data.maxFret;

    this.setData({ isLoading: true, errorMsg: '' });

    var self = this;
    setTimeout(function() {
      try {
        var result = getChordFingerings(root, type, maxFret);
        if (result.error) {
          self.setData({ errorMsg: result.error, isLoading: false });
          return;
        }
        if (result.fingerings.length === 0) {
          self.setData({ errorMsg: '未找到 ' + result.chordName + ' 的指法', isLoading: false });
          return;
        }

        wx.setStorageSync('currentFingeringResult', result);
        self.setData({ isLoading: false });

        wx.navigateTo({
          url: '/pages/result/result',
        });
      } catch (err) {
        self.setData({ errorMsg: '解析出错: ' + err.message, isLoading: false });
      }
    }, 100);
  },
});
