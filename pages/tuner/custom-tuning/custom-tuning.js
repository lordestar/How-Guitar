const tuningPresets = require('../../../utils/tuningPresets');

Page({
  data: {
    tuningName: '',
    strings: [],
    saveDisabled: true,
  },

  onLoad: function () {
    const strings = [];
    for (let i = 0; i < 6; i++) {
      const stringIndex = 6 - i;
      const range = tuningPresets.STRING_SAFE_RANGE[i];
      const defaultSemitone = range.standardSemitone;
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
    const name = this.data.tuningName.trim();
    const strings = this.data.strings;
    const hasWarning = false;
    for (let i = 0; i < strings.length; i++) {
      if (!tuningPresets.isNoteInSafeRange(strings[i].index, strings[i].currentSemitone)) {
        hasWarning = true;
        break;
      }
    }
    this.setData({ saveDisabled: !name || hasWarning });
  },

  onNameInput: function (e) {
    const name = e.detail.value;
    this.setData({ tuningName: name });
    this.checkSaveEnabled();
  },

  onSliderChanging: function (e) {
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    const semitone = e.detail.value;
    const key = 'strings[' + idx + '].currentSemitone';
    const noteKey = 'strings[' + idx + '].currentNote';
    const freqKey = 'strings[' + idx + '].currentFreq';
    const warnKey = 'strings[' + idx + '].showWarning';

    const note = tuningPresets.semitoneToNote(semitone);
    const freq = Math.round(tuningPresets.semitoneToFreq(semitone) * 100) / 100;
    const isSafe = tuningPresets.isNoteInSafeRange(this.data.strings[idx].index, semitone);

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

    const name = this.data.tuningName.trim();
    if (!name) {
      wx.showToast({ title: '请输入调弦名称', icon: 'none' });
      return;
    }

    const strings = this.data.strings;
    const hasWarning = false;
    for (let i = 0; i < strings.length; i++) {
      if (!tuningPresets.isNoteInSafeRange(strings[i].index, strings[i].currentSemitone)) {
        hasWarning = true;
        break;
      }
    }

    if (hasWarning) {
      wx.showToast({ title: '存在超出安全范围的音高', icon: 'none' });
      return;
    }

    const id = 'custom_' + Date.now();
    const description = '';
    const stringData = [];
    for (let i = 0; i < strings.length; i++) {
      const s = strings[i];
      stringData.push({
        string: s.index,
        note: s.currentNote,
        frequency: s.currentFreq,
        semitone: s.currentSemitone,
      });
      if (i > 0) description += ' ';
      description += s.currentNote;
    }

    const customTuning = {
      id: id,
      name: name,
      description: description,
      isCustom: true,
      strings: stringData,
    };

    const customList = wx.getStorageSync('customTunings') || [];
    customList.push(customTuning);
    wx.setStorageSync('customTunings', customList);
    wx.setStorageSync('lastTuningId', id);

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(function () {
      wx.navigateBack();
    }, 500);
  },
});
