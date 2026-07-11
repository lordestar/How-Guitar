// ============ utils/chordDatabase.js ============
// 常用吉他和弦指法数据库（前5品）
// 每个指法的 strings 数组从 6弦(index 0) 到 1弦(index 5)
// fret: 0=空弦, 1-5=品数, "x"=制音不弹

const CHORD_DATABASE = {};

// ──────────────────── C 系列 ────────────────────
CHORD_DATABASE['C'] = [
  {
    name: '开放C和弦',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
  {
    name: 'C和弦(5弦根音)',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 3, note: 'G', label: '3' },
    ],
  },
];

CHORD_DATABASE['Cm'] = [
  {
    name: 'Cm和弦(小横按)',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 5, note: 'G', label: '5' },
      { string: 3, fret: 5, note: 'Eb', label: '5' },
      { string: 4, fret: 4, note: 'C', label: '4' },
      { string: 5, fret: 3, note: 'Eb', label: '3' },
    ],
  },
];

CHORD_DATABASE['Cmaj7'] = [
  {
    name: 'Cmaj7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['C7'] = [
  {
    name: 'C7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 3, note: 'Bb', label: '3' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Cadd9'] = [
  {
    name: 'Cadd9',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 3, note: 'D', label: '3' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

// ──────────────────── D 系列 ────────────────────
CHORD_DATABASE['D'] = [
  {
    name: '开放D和弦',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 3, note: 'D', label: '3' },
      { string: 5, fret: 2, note: 'F#', label: '2' },
    ],
  },
];

CHORD_DATABASE['Dm'] = [
  {
    name: '开放Dm和弦',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 3, note: 'D', label: '3' },
      { string: 5, fret: 1, note: 'F', label: '1' },
    ],
  },
];

CHORD_DATABASE['Dm7'] = [
  {
    name: 'Dm7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 1, note: 'F', label: '1' },
    ],
  },
];

CHORD_DATABASE['D7'] = [
  {
    name: 'D7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 2, note: 'F#', label: '2' },
    ],
  },
];

CHORD_DATABASE['Dsus2'] = [
  {
    name: 'Dsus2',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 3, note: 'D', label: '3' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Dsus4'] = [
  {
    name: 'Dsus4',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 3, note: 'D', label: '3' },
      { string: 5, fret: 3, note: 'G', label: '3' },
    ],
  },
];

// ──────────────────── E 系列 ────────────────────
CHORD_DATABASE['E'] = [
  {
    name: '开放E和弦',
    strings: [
      { string: 0, fret: 0, note: 'E', label: '○' },
      { string: 1, fret: 2, note: 'B', label: '2' },
      { string: 2, fret: 2, note: 'G#', label: '2' },
      { string: 3, fret: 1, note: 'F#', label: '1' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Em'] = [
  {
    name: '开放Em和弦',
    strings: [
      { string: 0, fret: 0, note: 'E', label: '○' },
      { string: 1, fret: 2, note: 'B', label: '2' },
      { string: 2, fret: 2, note: 'G', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Em7'] = [
  {
    name: 'Em7',
    strings: [
      { string: 0, fret: 0, note: 'E', label: '○' },
      { string: 1, fret: 2, note: 'B', label: '2' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['E7'] = [
  {
    name: 'E7',
    strings: [
      { string: 0, fret: 0, note: 'E', label: '○' },
      { string: 1, fret: 2, note: 'B', label: '2' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 1, note: 'F#', label: '1' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

// ──────────────────── F 系列 ────────────────────
CHORD_DATABASE['F'] = [
  {
    name: 'F和弦(小横按)',
    strings: [
      { string: 0, fret: 1, note: 'F', label: '1' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 3, note: 'F', label: '3' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 1, note: 'F', label: '1' },
    ],
  },
  {
    name: 'F和弦(简化)',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 'x', note: null, label: '❌' },
      { string: 2, fret: 3, note: 'F', label: '3' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 1, note: 'F', label: '1' },
    ],
  },
];

CHORD_DATABASE['Fmaj7'] = [
  {
    name: 'Fmaj7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 3, note: 'C', label: '3' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 1, note: 'F', label: '1' },
    ],
  },
];

// ──────────────────── G 系列 ────────────────────
CHORD_DATABASE['G'] = [
  {
    name: '开放G和弦',
    strings: [
      { string: 0, fret: 3, note: 'G', label: '3' },
      { string: 1, fret: 2, note: 'A', label: '2' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 3, note: 'G', label: '3' },
    ],
  },
  {
    name: 'G和弦(4指)',
    strings: [
      { string: 0, fret: 3, note: 'G', label: '3' },
      { string: 1, fret: 2, note: 'A', label: '2' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 3, note: 'G', label: '4' },
    ],
  },
];

CHORD_DATABASE['G7'] = [
  {
    name: 'G7',
    strings: [
      { string: 0, fret: 3, note: 'G', label: '3' },
      { string: 1, fret: 2, note: 'A', label: '2' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 1, note: 'F', label: '1' },
      { string: 5, fret: 3, note: 'G', label: '3' },
    ],
  },
];

CHORD_DATABASE['G/B'] = [
  {
    name: 'G/B(转位)',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 2, note: 'A', label: '2' },
      { string: 2, fret: 0, note: 'D', label: '○' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 2, note: 'F#', label: '2' },
    ],
  },
];

// ──────────────────── A 系列 ────────────────────
CHORD_DATABASE['A'] = [
  {
    name: '开放A和弦',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 0, note: 'A', label: '○' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 2, note: 'C#', label: '2' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Am'] = [
  {
    name: '开放Am和弦',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 0, note: 'A', label: '○' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Am7'] = [
  {
    name: 'Am7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 0, note: 'A', label: '○' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 1, note: 'C', label: '1' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['A7'] = [
  {
    name: 'A7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 0, note: 'A', label: '○' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 2, note: 'C#', label: '2' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Asus2'] = [
  {
    name: 'Asus2',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 0, note: 'A', label: '○' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

CHORD_DATABASE['Asus4'] = [
  {
    name: 'Asus4',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 0, note: 'A', label: '○' },
      { string: 2, fret: 2, note: 'E', label: '2' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 3, note: 'D', label: '3' },
      { string: 5, fret: 0, note: 'E', label: '○' },
    ],
  },
];

// ──────────────────── B 系列 ────────────────────
CHORD_DATABASE['Bdim'] = [
  {
    name: 'Bdim',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 2, note: 'E', label: '2' },
      { string: 2, fret: 1, note: 'F', label: '1' },
      { string: 3, fret: 0, note: 'G', label: '○' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 1, note: 'F', label: '1' },
    ],
  },
];

CHORD_DATABASE['Bm'] = [
  {
    name: 'Bm(小横按)',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 2, note: 'E', label: '2' },
      { string: 2, fret: 4, note: 'F#', label: '4' },
      { string: 3, fret: 4, note: 'B', label: '4' },
      { string: 4, fret: 3, note: 'F#', label: '3' },
      { string: 5, fret: 2, note: 'B', label: '2' },
    ],
  },
];

CHORD_DATABASE['B7'] = [
  {
    name: 'B7',
    strings: [
      { string: 0, fret: 'x', note: null, label: '❌' },
      { string: 1, fret: 2, note: 'E', label: '2' },
      { string: 2, fret: 1, note: 'F', label: '1' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 0, note: 'B', label: '○' },
      { string: 5, fret: 2, note: 'B', label: '2' },
    ],
  },
];

// ──────────────────── 降号系列 ────────────────────
CHORD_DATABASE['Bb'] = [
  {
    name: 'Bb(大横按)',
    strings: [
      { string: 0, fret: 1, note: 'Bb', label: '1' },
      { string: 1, fret: 3, note: 'F', label: '3' },
      { string: 2, fret: 3, note: 'Bb', label: '3' },
      { string: 3, fret: 2, note: 'D', label: '2' },
      { string: 4, fret: 1, note: 'F', label: '1' },
      { string: 5, fret: 1, note: 'Bb', label: '1' },
    ],
  },
];

CHORD_DATABASE['F#m'] = [
  {
    name: 'F#m(小横按)',
    strings: [
      { string: 0, fret: 2, note: 'F#', label: '2' },
      { string: 1, fret: 4, note: 'C#', label: '4' },
      { string: 2, fret: 4, note: 'F#', label: '4' },
      { string: 3, fret: 2, note: 'A', label: '2' },
      { string: 4, fret: 2, note: 'C#', label: '2' },
      { string: 5, fret: 2, note: 'F#', label: '2' },
    ],
  },
];

// ──────────────────── 音程品质表 (算法生成用) ────────────────────
// key: 和弦类型名 → [半音音程]
const CHORD_TYPES = {
  '': [0, 4, 7],
  major: [0, 4, 7],
  m: [0, 3, 7],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  m9: [0, 3, 7, 10, 2],
  9: [0, 4, 7, 10, 2],
  maj9: [0, 4, 7, 11, 2],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  m7b5: [0, 3, 6, 10],
  6: [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  add9: [0, 4, 7, 2],
  '7sus4': [0, 5, 7, 10],
  11: [0, 4, 7, 10, 2, 5],
  13: [0, 4, 7, 10, 2, 5, 9],
};

// 和弦类型中文名
const CHORD_TYPE_NAMES = {
  '': '大三',
  major: '大三',
  minor: '小三',
  m: '小三',
  7: '属七',
  maj7: '大七',
  m7: '小七',
  m9: '小九',
  9: '属九',
  maj9: '大九',
  dim: '减三',
  aug: '增三',
  sus2: '挂二',
  sus4: '挂四',
  m7b5: '半减七',
  6: '大六',
  m6: '小六',
  add9: '加九',
  '7sus4': '属七挂四',
  11: '属十一',
  13: '属十三',
};

// 根音列表（显示用）
const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 降号音名列表（用于需要降号的和弦，如 Cm → C Eb G）
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// 音名转半音索引
function noteToSemitone(note) {
  let idx = ROOT_NOTES.indexOf(note);
  if (idx < 0) idx = FLAT_NOTES.indexOf(note);
  return idx >= 0 ? idx : -1;
}

// 半音索引转音名（默认升号）
function semitoneToNote(semi) {
  return ROOT_NOTES[((semi % 12) + 12) % 12];
}

// 智能选择音名：根据根音和弦类型选择升号或降号
function getSmartNoteName(root, type, semi) {
  const idx = ((semi % 12) + 12) % 12;

  // 根音带降号 → 用降号
  if (root.indexOf('b') >= 0) return FLAT_NOTES[idx];
  // 根音带升号 → 用升号
  if (root.indexOf('#') >= 0) return ROOT_NOTES[idx];

  // 自然根音：小调/减类和弦一般用降号
  const flatTypes = ['m', 'm7', 'm9', 'm6', 'm7b5', 'dim', 'dim7', 'ø', '°'];
  let useFlat = false;
  for (let ft = 0; ft < flatTypes.length; ft++) {
    if (type === flatTypes[ft]) {
      useFlat = true;
      break;
    }
  }

  // F 大调也有降号（Bb）
  if (root === 'F' && !useFlat) {
    // F major: F, A, C — 这里没有降号问题，但为了Bb，如果 type 是带 7 的
    if (type === '7' || type === 'maj7' || type === 'dominant') useFlat = true;
  }

  // B 大调相关用升号更合适
  if (root === 'B' && !useFlat) useFlat = false;

  if (useFlat) return FLAT_NOTES[idx];
  return ROOT_NOTES[idx];
}

// 根据根音+类型获取和弦组成音
function getChordNotes(root, type) {
  if (!type) type = 'major';
  const intervals = CHORD_TYPES[type];
  if (!intervals) return { error: '不支持的和弦类型: ' + type };
  const rootIdx = noteToSemitone(root);
  if (rootIdx < 0) return { error: '无效的根音: ' + root };
  const notes = intervals.map(function (semi) {
    return getSmartNoteName(root, type, rootIdx + semi);
  });
  return {
    root: root,
    type: type,
    typeName: CHORD_TYPE_NAMES[type] || type,
    intervalCount: intervals.length,
    notes: notes,
    noteValues: intervals.map(function (semi) {
      return (rootIdx + semi) % 12;
    }),
  };
}

// 从数据库获取和弦指法
function getChordFromDatabase(root, type) {
  const chordName = root + (type === 'major' || type === '' ? '' : type);
  // 特殊处理
  if (root === 'D#' && type === 'major') chordName = 'Eb';
  if (root === 'G#' && type === 'major') chordName = 'Ab';
  if (root === 'A#' && type === 'major') chordName = 'Bb';

  return CHORD_DATABASE[chordName] || null;
}

// 获取所有支持的根音
function getAllRootNotes() {
  return ROOT_NOTES;
}

// 获取所有支持的和弦类型
function getAllChordTypes() {
  const types = [];
  for (let key in CHORD_TYPES) {
    types.push({ key: key, name: CHORD_TYPE_NAMES[key] || key });
  }
  return types;
}

module.exports = {
  CHORD_DATABASE: CHORD_DATABASE,
  CHORD_TYPES: CHORD_TYPES,
  CHORD_TYPE_NAMES: CHORD_TYPE_NAMES,
  ROOT_NOTES: ROOT_NOTES,
  FLAT_NOTES: FLAT_NOTES,
  noteToSemitone: noteToSemitone,
  semitoneToNote: semitoneToNote,
  getSmartNoteName: getSmartNoteName,
  getChordNotes: getChordNotes,
  getChordFromDatabase: getChordFromDatabase,
  getAllRootNotes: getAllRootNotes,
  getAllChordTypes: getAllChordTypes,
};
