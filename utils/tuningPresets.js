var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function semitoneToFreq(semitone) {
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

function semitoneToNote(semitone) {
  var noteIndex = ((semitone % 12) + 12) % 12;
  var octave = Math.floor(semitone / 12) - 1;
  return NOTE_NAMES[noteIndex] + octave;
}

function makeString(stringIndex, semitone) {
  return {
    string: stringIndex,
    note: semitoneToNote(semitone),
    frequency: Math.round(semitoneToFreq(semitone) * 100) / 100,
    semitone: semitone,
  };
}

var PRESET_TUNINGS = [
  {
    id: 'standard',
    name: '标准调弦',
    nameEn: 'Standard',
    description: 'EADGBE — 最常用标准调弦',
    strings: [
      makeString(6, 40),
      makeString(5, 45),
      makeString(4, 50),
      makeString(3, 55),
      makeString(2, 59),
      makeString(1, 64),
    ],
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    nameEn: 'Drop D',
    description: 'DADGBE — 第6弦降2半音',
    strings: [
      makeString(6, 38),
      makeString(5, 45),
      makeString(4, 50),
      makeString(3, 55),
      makeString(2, 59),
      makeString(1, 64),
    ],
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    nameEn: 'DADGAD',
    description: 'DADGAD — 指弹经典调弦',
    strings: [
      makeString(6, 38),
      makeString(5, 45),
      makeString(4, 50),
      makeString(3, 55),
      makeString(2, 57),
      makeString(1, 62),
    ],
  },
  {
    id: 'open-d',
    name: 'Open D',
    nameEn: 'Open D',
    description: 'DADF#AD — 开放D和弦调弦',
    strings: [
      makeString(6, 38),
      makeString(5, 45),
      makeString(4, 50),
      makeString(3, 54),
      makeString(2, 57),
      makeString(1, 62),
    ],
  },
  {
    id: 'open-g',
    name: 'Open G',
    nameEn: 'Open G',
    description: 'DGDGBD — 开放G和弦调弦',
    strings: [
      makeString(6, 38),
      makeString(5, 43),
      makeString(4, 50),
      makeString(3, 55),
      makeString(2, 59),
      makeString(1, 62),
    ],
  },
  {
    id: 'half-step-down',
    name: '半音降调',
    nameEn: 'Half Step Down',
    description: 'EbAbDbGbBbEb — 全部降1半音',
    strings: [
      makeString(6, 39),
      makeString(5, 44),
      makeString(4, 49),
      makeString(3, 54),
      makeString(2, 58),
      makeString(1, 63),
    ],
  },
  {
    id: 'full-step-down',
    name: '全音降调',
    nameEn: 'Full Step Down',
    description: 'DGCFAD — 全部降2半音',
    strings: [
      makeString(6, 38),
      makeString(5, 43),
      makeString(4, 48),
      makeString(3, 53),
      makeString(2, 57),
      makeString(1, 62),
    ],
  },
];

var STRING_SAFE_RANGE = [
  { string: 6, standardSemitone: 40, minSemitone: 35, maxSemitone: 43 },
  { string: 5, standardSemitone: 45, minSemitone: 40, maxSemitone: 48 },
  { string: 4, standardSemitone: 50, minSemitone: 45, maxSemitone: 51 },
  { string: 3, standardSemitone: 55, minSemitone: 52, maxSemitone: 57 },
  { string: 2, standardSemitone: 59, minSemitone: 56, maxSemitone: 61 },
  { string: 1, standardSemitone: 64, minSemitone: 61, maxSemitone: 66 },
];

function getTuningById(id) {
  for (var i = 0; i < PRESET_TUNINGS.length; i++) {
    if (PRESET_TUNINGS[i].id === id) return PRESET_TUNINGS[i];
  }
  return null;
}

function getAllPresets() {
  return PRESET_TUNINGS;
}

function isNoteInSafeRange(stringIndex, semitone) {
  if (stringIndex < 1 || stringIndex > 6) return false;
  var range = STRING_SAFE_RANGE[6 - stringIndex];
  return semitone >= range.minSemitone && semitone <= range.maxSemitone;
}

function getValidSemitonesForString(stringIndex) {
  if (stringIndex < 1 || stringIndex > 6) return [];
  var range = STRING_SAFE_RANGE[6 - stringIndex];
  var result = [];
  for (var s = range.minSemitone; s <= range.maxSemitone; s++) {
    result.push(s);
  }
  return result;
}

module.exports = {
  PRESET_TUNINGS: PRESET_TUNINGS,
  STRING_SAFE_RANGE: STRING_SAFE_RANGE,
  getTuningById: getTuningById,
  getAllPresets: getAllPresets,
  isNoteInSafeRange: isNoteInSafeRange,
  getValidSemitonesForString: getValidSemitonesForString,
  semitoneToNote: semitoneToNote,
  semitoneToFreq: semitoneToFreq,
};
