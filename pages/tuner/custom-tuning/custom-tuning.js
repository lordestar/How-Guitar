var tuningPresets = require('../../../utils/tuningPresets');

Page({
  data: {
    tuningName: '',
    strings: [],
    saveDisabled: true,
  },

  onLoad: function () {
    var strings = [];
    for (var i = 0; i < 6; i++) {
      var stringIndex = 6 - i;
      var range = tuningPresets.STRING_SAFE_RANGE[i];
      var defaultSemitone = range.standardSemitone;
      strings.push({
        index: stringIndex,
        minSemitone: range.minSemitone,
        maxSemitone: range.maxSemitone,
        currentSemitone: defaultSemitone,
        currentNote: tuningPresets.semitoneToNote(defaultSemitone),
        currentFreq: Math.round(tuningPresets.semitoneToFreq(defaultSemitone) * 100) / 100,
        showWarning: false,
      });
    }
    this.setData({ strings: strings });
  },

  checkSaveEnabled: function () {
    var name = this.data.tuningName.trim();
    var strings = this.data.strings;
    var hasWarning = false;
    for (var i = 0; i < strings.length; i++) {
      if (!tuningPresets.isNoteInSafeRange(strings[i].index, strings[i].currentSemitone)) {
        hasWarning = true;
        break;
      }
    }
    this.setData({ saveDisabled: !name || hasWarning });
  },

  onNameInput: function (e) {
    var name = e.detail.value;
    this.setData({ tuningName: name });
    this.checkSaveEnabled();
  },

  onSliderChanging: function (e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10);
    var semitone = e.detail.value;
    var key = 'strings[' + idx + '].currentSemitone';
    var noteKey = 'strings[' + idx + '].currentNote';
    var freqKey = 'strings[' + idx + '].currentFreq';
    var warnKey = 'strings[' + idx + '].showWarning';

    var note = tuningPresets.semitoneToNote(semitone);
    var freq = Math.round(tuningPresets.semitoneToFreq(semitone) * 100) / 100;
    var isSafe = tuningPresets.isNoteInSafeRange(this.data.strings[idx].index, semitone);

    this.setData({
      [key]: semitone,
      [noteKey]: note,
      [freqKey]: freq,
      [warnKey]: !isSafe,
    });
    this.checkSaveEnabled();
  },

  onCancel: function () {
    wx.navigateBack();
  },

  onSave: function () {
    if (this.data.saveDisabled) return;

    var name = this.data.tuningName.trim();
    if (!name) {
      wx.showToast({ title: '请输入调弦名称', icon: 'none' });
      return;
    }

    var strings = this.data.strings;
    var hasWarning = false;
    for (var i = 0; i < strings.length; i++) {
      if (!tuningPresets.isNoteInSafeRange(strings[i].index, strings[i].currentSemitone)) {
        hasWarning = true;
        break;
      }
    }

    if (hasWarning) {
      wx.showToast({ title: '存在超出安全范围的音高', icon: 'none' });
      return;
    }

    var id = 'custom_' + Date.now();
    var description = '';
    var stringData = [];
    for (var i = 0; i < strings.length; i++) {
      var s = strings[i];
      stringData.push({
        string: s.index,
        note: s.currentNote,
        frequency: s.currentFreq,
        semitone: s.currentSemitone,
      });
      if (i > 0) description += ' ';
      description += s.currentNote;
    }

    var customTuning = {
      id: id,
      name: name,
      description: description,
      isCustom: true,
      strings: stringData,
    };

    var customList = wx.getStorageSync('customTunings') || [];
    customList.push(customTuning);
    wx.setStorageSync('customTunings', customList);
    wx.setStorageSync('lastTuningId', id);

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(function () {
      wx.navigateBack();
    }, 500);
  },
});
