// ============ utils/fretboard.js ============
// 重构版：把位聚类 + 多样性评分 + 相似度去重
// 核心改动：去掉 maxFret 参数，固定搜索 0-14 品
// 用把位聚类替代单一评分排序，保证每个把位区域都有代表指法

const {
  CHORD_DATABASE,
  noteToSemitone,
  ROOT_NOTES,
  getSmartNoteName,
  getChordNotes,
} = require('./chordDatabase');

const OPEN_STRINGS = [
  { string: 0, note: 'E', value: 4, name: '6' },
  { string: 1, note: 'A', value: 9, name: '5' },
  { string: 2, note: 'D', value: 2, name: '4' },
  { string: 3, note: 'G', value: 7, name: '3' },
  { string: 4, note: 'B', value: 11, name: '2' },
  { string: 5, note: 'E', value: 4, name: '1' },
];

function getNoteAtFret(stringIndex, fret) {
  const openValue = OPEN_STRINGS[stringIndex].value;
  const noteValue = (openValue + fret) % 12;
  return { value: noteValue, name: ROOT_NOTES[noteValue] };
}

function getChordPositionsOnString(stringIndex, chordNoteValues, maxFret) {
  const positions = [];
  const openValue = OPEN_STRINGS[stringIndex].value;
  if (chordNoteValues.indexOf(openValue) >= 0) {
    positions.push({
      string: stringIndex,
      fret: 0,
      note: OPEN_STRINGS[stringIndex].note,
      noteValue: openValue,
      isOpen: true,
    });
  }
  for (let f = 1; f <= maxFret; f++) {
    const nv = (openValue + f) % 12;
    if (chordNoteValues.indexOf(nv) >= 0) {
      positions.push({
        string: stringIndex,
        fret: f,
        note: ROOT_NOTES[nv],
        noteValue: nv,
        isOpen: false,
      });
    }
  }
  return positions;
}

// ===== 回溯搜索（固定 14 品）=====
const SEARCH_MAX_FRET = 14;

function findAllFingerings(chordNoteValues) {
  const candidatesPerString = [];
  for (let s = 0; s < 6; s++) {
    candidatesPerString.push(getChordPositionsOnString(s, chordNoteValues, SEARCH_MAX_FRET));
  }
  const results = [];
  const visited = {};

  function backtrack(stringIdx, current, covered) {
    const uncovered = chordNoteValues.filter(function (n) {
      return covered.indexOf(n) < 0;
    });
    if (uncovered.length > 6 - stringIdx) return;

    if (stringIdx === 6) {
      const allCovered = chordNoteValues.every(function (n) {
        return covered.indexOf(n) >= 0;
      });
      if (!allCovered) return;
      const sounding = current.filter(function (p) {
        return p !== null;
      });
      if (sounding.length < 3) return;
      const fp = current
        .map(function (p) {
          return p === null ? 'x' : p.string + '-' + p.fret;
        })
        .join('|');
      if (visited[fp]) return;
      visited[fp] = true;
      results.push({ positions: current.slice(), stringCount: sounding.length });
      return;
    }

    backtrack(stringIdx + 1, current.concat([null]), covered.slice());
    const candidates = candidatesPerString[stringIdx];
    for (let ci = 0; ci < candidates.length; ci++) {
      const pos = candidates[ci];
      const newCovered = covered.slice();
      if (newCovered.indexOf(pos.noteValue) < 0) newCovered.push(pos.noteValue);
      backtrack(stringIdx + 1, current.concat([pos]), newCovered);
    }
  }

  backtrack(0, [], []);
  return results;
}

// ===== 合理性检查 =====
const MAX_FRET_SPAN = 5;

function calcFretSpan(strings) {
  let minF = 999,
    maxF = 0;
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    if (s.fret === 'x' || s.fret === null || s.fret === undefined) continue;
    const f = parseInt(s.fret, 10);
    if (isNaN(f)) continue;
    if (f < minF) minF = f;
    if (f > maxF) maxF = f;
  }
  return maxF - minF;
}

function isFingeringReasonable(strings) {
  const sounding = [];
  for (let i = 0; i < strings.length; i++) {
    if (strings[i].fret !== 'x' && strings[i].fret !== null && strings[i].fret !== undefined)
      sounding.push(i);
  }
  if (sounding.length < 3) return false;
  const first = sounding[0],
    last = sounding[sounding.length - 1];
  for (let j = first + 1; j < last; j++) {
    let ok = false;
    for (let k = 0; k < sounding.length; k++) {
      if (sounding[k] === j) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }
  return 6 - sounding.length <= 2;
}

// ===== 把位锚点 =====
function calcAnchorFret(strings) {
  let minF = 999;
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    if (s.fret === 'x' || s.fret === null || s.fret === undefined) continue;
    const f = parseInt(s.fret, 10);
    if (isNaN(f) || f === 0) continue;
    if (f < minF) minF = f;
  }
  return minF === 999 ? 0 : minF;
}

// 把位分组：低把位 0-4，中把位 5-8，高把位 9+
function getGroup(anchor) {
  if (anchor <= 4) return 'low';
  if (anchor <= 8) return 'mid';
  return 'high';
}

// ===== 横按评分 =====
function calcBarreScore(strings) {
  const counts = {};
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    if (s.fret === 'x' || s.fret === null || s.fret === undefined) continue;
    const f = parseInt(s.fret, 10);
    if (isNaN(f) || f === 0) continue;
    counts[f] = (counts[f] || 0) + 1;
  }
  let best = 0;
  for (let k in counts) {
    if (counts[k] > best) best = counts[k];
  }
  if (best >= 4) return 10;
  if (best >= 3) return 6;
  if (best >= 2) return 2;
  return 0;
}

// ===== 综合评分（不偏向低品）=====
function scoreFingering(strings, root) {
  let score = 0;
  score += calcBarreScore(strings);
  score += Math.max(0, (6 - calcFretSpan(strings)) * 2);

  let sounding = 0,
    openCount = 0;
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    if (s.fret !== 'x' && s.fret !== null && s.fret !== undefined) {
      sounding++;
      const f = parseInt(s.fret, 10);
      if (f === 0) openCount++;
    }
  }
  score += (sounding - 3) * 2;
  score += Math.min(openCount, 4);

  const rootVal = noteToSemitone(root);
  if (rootVal >= 0) {
    for (let si = 0; si < 6; si++) {
      const st = strings[si];
      if (st.fret !== 'x' && st.noteValue !== undefined && st.noteValue === rootVal) {
        if (si <= 1) {
          score += 4;
          break;
        }
        if (si === 2) {
          score += 2;
          break;
        }
      }
    }
  }
  return score;
}

// ===== 相似度去重 =====
function fingeringsSimilar(a, b) {
  let diffs = 0;
  for (let i = 0; i < 6; i++) {
    if (a[i].fret !== b[i].fret) {
      diffs++;
      if (diffs > 1) return false;
    }
  }
  return diffs <= 1;
}

// ===== 聚类选优 =====
function clusterAndSelect(fingerings, root) {
  const clusters = { low: [], mid: [], high: [] };
  for (let i = 0; i < fingerings.length; i++) {
    const anchor = calcAnchorFret(fingerings[i].strings);
    const group = getGroup(anchor);
    clusters[group].push(fingerings[i]);
  }

  const result = [];
  const groupOrder = ['low', 'mid', 'high'];
  const groupNames = { low: '', mid: '', high: '' };
  const counter = { low: 0, mid: 0, high: 0 };

  for (let gi = 0; gi < groupOrder.length; gi++) {
    const group = groupOrder[gi];
    const list = clusters[group];
    if (list.length === 0) continue;

    list.sort(function (a, b) {
      return scoreFingering(b.strings, root) - scoreFingering(a.strings, root);
    });

    const selected = [];
    for (let si = 0; si < list.length; si++) {
      let dup = false;
      for (let sj = 0; sj < selected.length; sj++) {
        if (fingeringsSimilar(list[si].strings, selected[sj].strings)) {
          dup = true;
          break;
        }
      }
      if (!dup) {
        counter[group]++;
        const anchor = calcAnchorFret(list[si].strings);
        const posLabel = anchor <= 4 ? '' : ' @' + anchor;
        list[si].name = groupNames[group] + '' + counter[group] + posLabel;
        selected.push(list[si]);
        if (selected.length >= 2) break;
      }
    }
    for (let sk = 0; sk < selected.length; sk++) {
      result.push(selected[sk]);
    }
  }

  return result;
}

// ===== 主入口 =====
function getChordFingerings(root, type, _ignored) {
  const typeToDbKey = {
    major: '',
    m: 'm',
    7: '7',
    maj7: 'maj7',
    m7: 'm7',
    m9: 'm9',
    9: '9',
    maj9: 'maj9',
    dim: 'dim',
    aug: 'aug',
    sus2: 'sus2',
    sus4: 'sus4',
    m7b5: 'm7b5',
    6: '6',
    m6: 'm6',
    add9: 'add9',
    '7sus4': '7sus4',
    11: '11',
    13: '13',
  };
  const dbSuffix = typeof typeToDbKey[type] !== 'undefined' ? typeToDbKey[type] : type;
  const chordName = root + dbSuffix;

  if (root === 'D#' && dbSuffix === '') chordName = 'Eb';
  if (root === 'G#' && dbSuffix === '') chordName = 'Ab';
  if (root === 'A#' && dbSuffix === '') chordName = 'Bb';
  if (root === 'D#' && dbSuffix === 'm') chordName = 'Ebm';
  if (root === 'G#' && dbSuffix === 'm') chordName = 'Abm';
  if (root === 'A#' && dbSuffix === 'm') chordName = 'Bbm';

  const chordInfo = getChordNotes(root, type);
  if (chordInfo.error) return { error: chordInfo.error };

  const allFingerings = [];

  // 1. 数据库指法
  const dbResult = CHORD_DATABASE[chordName];
  if (dbResult) {
    for (let di = 0; di < dbResult.length; di++) {
      const dbF = dbResult[di];
      if (calcFretSpan(dbF.strings) <= MAX_FRET_SPAN && isFingeringReasonable(dbF.strings)) {
        allFingerings.push({ name: dbF.name, strings: dbF.strings, _fromDb: true });
      }
    }
  }

  // 2. 算法生成
  const algoResults = findAllFingerings(chordInfo.noteValues);
  for (let i = 0; i < algoResults.length; i++) {
    const ar = algoResults[i];
    const fg = { name: '', strings: [], _fromDb: false };
    for (let s = 0; s < 6; s++) {
      const pos = ar.positions[s];
      if (pos === null) {
        fg.strings.push({ string: s, fret: 'x', note: null, label: 'X' });
      } else {
        const sn = getSmartNoteName(root, type, pos.noteValue);
        fg.strings.push({
          string: s,
          fret: pos.fret,
          note: sn,
          noteValue: pos.noteValue,
          label: pos.isOpen ? 'O' : String(pos.fret),
        });
      }
    }
    if (calcFretSpan(fg.strings) <= MAX_FRET_SPAN && isFingeringReasonable(fg.strings)) {
      allFingerings.push(fg);
    }
  }

  // 3. 分离数据库 / 算法
  const dbList = [],
    algoList = [];
  for (let fi = 0; fi < allFingerings.length; fi++) {
    if (allFingerings[fi]._fromDb) dbList.push(allFingerings[fi]);
    else algoList.push(allFingerings[fi]);
  }

  // 4. 数据库去重
  const dbFinal = [],
    seenSigs = [];
  for (let di2 = 0; di2 < dbList.length; di2++) {
    const sig = dbList[di2].strings
      .map(function (st) {
        return st.fret;
      })
      .join(',');
    let dup = false;
    for (let ds = 0; ds < seenSigs.length; ds++) {
      if (sig === seenSigs[ds]) {
        dup = true;
        break;
      }
    }
    if (!dup) {
      seenSigs.push(sig);
      dbFinal.push(dbList[di2]);
    }
  }

  // 5. 算法聚类选优
  const algoSelected = clusterAndSelect(algoList, root);

  // 6. 合并
  const final = dbFinal.concat(algoSelected);
  if (final.length > 20) final = final.slice(0, 20);

  for (let fi2 = 0; fi2 < final.length; fi2++) final[fi2]._fromDb = null;

  return {
    root: root,
    type: type,
    chordName: chordName,
    chordNotes: chordInfo.notes,
    fingerings: final,
    totalCount: final.length,
  };
}

;

module.exports = { OPEN_STRINGS, getNoteAtFret, getChordPositionsOnString, findAllFingerings, getChordFingerings, calcFretSpan, isFingeringReasonable , calcFretSpan, isFingeringReasonable };