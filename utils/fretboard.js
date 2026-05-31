// ============ utils/fretboard.js ============
// 重构版：所有发声的弦必须属于和弦音
// 每根弦有三种状态：按某品(和弦音)、空弦(仅当空弦音是和弦音)、制音(x)

const { CHORD_DATABASE, noteToSemitone, ROOT_NOTES, getSmartNoteName } = require('./chordDatabase');

// 标准调弦（从 6弦 到 1弦）
// 空弦音名: E=4, A=9, D=2, G=7, B=11, E=4 (12取模值)
var OPEN_STRINGS = [
  { string: 0, note: 'E',  value: 4,  name: '6弦' },
  { string: 1, note: 'A',  value: 9,  name: '5弦' },
  { string: 2, note: 'D',  value: 2,  name: '4弦' },
  { string: 3, note: 'G',  value: 7,  name: '3弦' },
  { string: 4, note: 'B',  value: 11, name: '2弦' },
  { string: 5, note: 'E',  value: 4,  name: '1弦' },
];

// 获取某弦某品的音名和半音值
function getNoteAtFret(stringIndex, fret) {
  var openValue = OPEN_STRINGS[stringIndex].value;
  var noteValue = (openValue + fret) % 12;
  return {
    value: noteValue,
    name: ROOT_NOTES[noteValue],
  };
}

// 获取某弦上所有可用的和弦音位置
function getChordPositionsOnString(stringIndex, chordNoteValues, maxFret) {
  var positions = [];
  // 检查空弦（0品）
  var openValue = OPEN_STRINGS[stringIndex].value;
  if (chordNoteValues.indexOf(openValue) >= 0) {
    positions.push({
      string: stringIndex,
      fret: 0,
      note: OPEN_STRINGS[stringIndex].note,
      noteValue: openValue,
      isOpen: true,
    });
  }
  // 检查1品到 maxFret 品
  for (var f = 1; f <= maxFret; f++) {
    var nv = (openValue + f) % 12;
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

/**
 * 搜索所有有效的指法组合
 * 约束：
 *   每根弦：x(制音) / 0(空弦-仅当空弦音是和弦音) / 按品(和弦音)
 *   所有和弦音至少出现一次
 *   至少弹 3 根弦
 */
function findAllFingerings(chordNoteValues, maxFret) {
  var candidatesPerString = [];
  for (var s = 0; s < 6; s++) {
    candidatesPerString.push(getChordPositionsOnString(s, chordNoteValues, maxFret));
  }

  var results = [];
  var visited = {};

  function backtrack(stringIdx, currentFingering, coveredValues) {
    // 剪枝：剩余弦数不够覆盖剩余音符
    var uncovered = chordNoteValues.filter(function(n) {
      return coveredValues.indexOf(n) < 0;
    });
    if (uncovered.length > (6 - stringIdx)) return;

    if (stringIdx === 6) {
      // 检查所有和弦音是否至少出现一次
      var allCovered = chordNoteValues.every(function(n) {
        return coveredValues.indexOf(n) >= 0;
      });
      if (!allCovered) return;

      // 检查至少弹了 3 根弦（排除制音的弦）
      var soundingCount = currentFingering.filter(function(p) {
        return p !== null;
      }).length;
      if (soundingCount < 3) return;

      // 去重指纹
      var fp = currentFingering.map(function(p) {
        if (p === null) return 'x';
        return p.string + '-' + p.fret;
      }).join('|');
      if (visited[fp]) return;
      visited[fp] = true;

      results.push({
        positions: currentFingering.slice(),
        pressed: currentFingering.filter(function(p) { return p !== null; }),
        stringCount: soundingCount,
      });
      return;
    }

    // === 选项1：制音 (x) ===
    backtrack(stringIdx + 1, currentFingering.concat([null]), coveredValues.slice());

    // === 选项2：用和弦音按该弦 ===
    var candidates = candidatesPerString[stringIdx];
    for (var ci = 0; ci < candidates.length; ci++) {
      var pos = candidates[ci];
      var newCovered = coveredValues.slice();
      if (newCovered.indexOf(pos.noteValue) < 0) {
        newCovered.push(pos.noteValue);
      }
      backtrack(stringIdx + 1, currentFingering.concat([pos]), newCovered);
    }
  }

  backtrack(0, [], []);
  return results;
}

/**
 * 获取和弦指法
 * 优先从数据库查询，找不到则用算法生成
 * 筛选规则：所有指法的手指跨度不超过 MAX_FRET_SPAN 品
 */
var MAX_FRET_SPAN = 5;

// 计算一个指法的品数跨度（最高品 - 最低非空弦品）
function calcFretSpan(strings) {
  var minFret = 999;
  var maxFret = 0;
  for (var i = 0; i < strings.length; i++) {
    var s = strings[i];
    if (s.fret === 'x' || s.fret === null || s.fret === undefined) continue;
    var f = parseInt(s.fret, 10);
    if (isNaN(f)) continue;
    if (f < minFret) minFret = f;
    if (f > maxFret) maxFret = f;
  }
  return maxFret - minFret;
}

// 检查指法是否合理
function isFingeringReasonable(strings) {
  // 找到所有发声（非制音）的弦索引
  var soundingIndices = [];
  for (var i = 0; i < strings.length; i++) {
    if (strings[i].fret !== 'x' && strings[i].fret !== null && strings[i].fret !== undefined) {
      soundingIndices.push(i);
    }
  }

  if (soundingIndices.length < 3) return false;

  // 检查"中间空洞"：最低和最高发声弦之间如果有制音弦，跳过
  var first = soundingIndices[0];
  var last = soundingIndices[soundingIndices.length - 1];
  for (var j = first + 1; j < last; j++) {
    // j 在 first 和 last 之间
    var isSounding = false;
    for (var k = 0; k < soundingIndices.length; k++) {
      if (soundingIndices[k] === j) { isSounding = true; break; }
    }
    if (!isSounding) return false; // 中间有空洞，不方便按
  }

  // 检查"跳弹"：按了相隔很远的弦（如只按2弦和5弦，跨度4根弦）
  // 已经通过 span 检查过了

  // 检查是否只有1-2根弦发声（少于3根已过滤）
  // 检查制音弦不能太多（最多2根制音弦比较合理）
  var mutedCount = 6 - soundingIndices.length;
  if (mutedCount > 2) return false;

  return true;
}

// 算法指法评分：越高越优先
function scoreAlgorithmFingering(fingering, root) {
  var strings = fingering.strings;
  var score = 0;

  // 1. 开放弦加分（开放弦指法更常规）
  for (var i = 0; i < strings.length; i++) {
    if (strings[i].fret === 0 || strings[i].fret === '0') {
      // 开放弦在高音弦（1-3弦）上 +2分，在低音弦上 +1分
      if (i >= 3) score += 2; // 1-3弦（数据索引3,4,5）
      else score += 1;        // 4-6弦（数据索引0,1,2）
    }
  }

  // 2. 品位低加分（每品 -2分）
  var totalFret = 0, fretCount = 0;
  for (var j = 0; j < strings.length; j++) {
    var f = parseInt(strings[j].fret, 10);
    if (!isNaN(f) && f > 0) {
      totalFret += f;
      fretCount++;
    }
  }
  if (fretCount > 0) {
    var avgFret = totalFret / fretCount;
    score += Math.max(0, 12 - avgFret) * 1.5;
  }

  // 3. 跨度小加分
  var span = calcFretSpan(strings);
  score += Math.max(0, 5 - span) * 3;

  // 4. 弹的弦数多加分（满6根最好，但至少3根）
  var soundingCount = 0;
  for (var k = 0; k < strings.length; k++) {
    if (strings[k].fret !== 'x' && strings[k].fret !== null) {
      soundingCount++;
    }
  }
  score += (soundingCount - 3) * 2;

  // 5. 根音在最低音弦加分（常规指法特征）
  var rootValue = require('./chordDatabase').noteToSemitone(root);
  if (rootValue >= 0) {
    for (var si = 0; si < 6; si++) {
      var st = strings[si];
      if (st.fret !== 'x' && st.noteValue !== undefined && st.noteValue === rootValue) {
        // 在 5弦 或 6弦 上出现根音 +5分
        if (si <= 1) score += 5;
        break;
      }
    }
  }

  return score;
}

function getChordFingerings(root, type, maxFret) {
  // 构建数据库查询用弦名：类型映射到数据库key
  var typeToDbKey = {
    'major': '',
    'm': 'm',
    '7': '7',
    'maj7': 'maj7',
    'm7': 'm7',
    'm9': 'm9',
    '9': '9',
    'maj9': 'maj9',
    'dim': 'dim',
    'aug': 'aug',
    'sus2': 'sus2',
    'sus4': 'sus4',
    'm7b5': 'm7b5',
    '6': '6',
    'm6': 'm6',
    'add9': 'add9',
    '7sus4': '7sus4',
    '11': '11',
    '13': '13',
  };
  var dbSuffix = typeof typeToDbKey[type] !== 'undefined' ? typeToDbKey[type] : type;
  var chordName = root + dbSuffix;
  // 特殊映射：D#→Eb等
  if (root === 'D#' && dbSuffix === '') chordName = 'Eb';
  if (root === 'G#' && dbSuffix === '') chordName = 'Ab';
  if (root === 'A#' && dbSuffix === '') chordName = 'Bb';
  if (root === 'D#' && dbSuffix === 'm') chordName = 'Ebm';
  if (root === 'G#' && dbSuffix === 'm') chordName = 'Abm';
  if (root === 'A#' && dbSuffix === 'm') chordName = 'Bbm';
  
  var chordInfo = require('./chordDatabase').getChordNotes(root, type);
  if (chordInfo.error) return { error: chordInfo.error };

  var fingerings = [];

  // 1. 先尝试数据库查找（手写指法，永远排在算法前面）
  var dbResult = CHORD_DATABASE[chordName];
  if (dbResult && maxFret >= 5) {
    for (var di = 0; di < dbResult.length; di++) {
      var dbF = dbResult[di];
      // 浅拷贝并标记来源
      if (calcFretSpan(dbF.strings) <= MAX_FRET_SPAN && isFingeringReasonable(dbF.strings)) {
        fingerings.push({
          name: dbF.name,
          strings: dbF.strings,
          _fromDb: true,
          _dbIndex: di,
        });
      }
    }
  }

  // 2. 用算法生成（补充数据库没有的指法）
  var algoResults = findAllFingerings(chordInfo.noteValues, maxFret);

  // 对算法结果也按数据库格式包装，并过滤
  for (var i = 0; i < algoResults.length; i++) {
    var ar = algoResults[i];
    var dbFingering = {
      name: '',
      strings: [],
      _fromDb: false,
      _dbIndex: 999,
    };
    for (var s = 0; s < 6; s++) {
      var pos = ar.positions[s];
      if (pos === null) {
        dbFingering.strings.push({
          string: s,
          fret: 'x',
          note: null,
          label: '❌',
        });
      } else {
        var smartNote = getSmartNoteName(root, type, pos.noteValue);
        dbFingering.strings.push({
          string: s,
          fret: pos.fret,
          note: smartNote,
          noteValue: pos.noteValue,
          label: pos.isOpen ? '○' : String(pos.fret),
        });
      }
    }
    if (calcFretSpan(dbFingering.strings) <= MAX_FRET_SPAN && isFingeringReasonable(dbFingering.strings)) {
      fingerings.push(dbFingering);
    }
  }

  // 3. 综合排序
  fingerings.sort(function(a, b) {
    // 优先：数据库指法 > 算法指法
    if (a._fromDb && !b._fromDb) return -1;
    if (!a._fromDb && b._fromDb) return 1;
    
    // 数据库内部按原始顺序
    if (a._fromDb && b._fromDb) {
      return a._dbIndex - b._dbIndex;
    }

    // 算法指法：计算综合评分
    var scoreA = scoreAlgorithmFingering(a, root);
    var scoreB = scoreAlgorithmFingering(b, root);
    return scoreB - scoreA;
  });

  // 给算法指法命名
  var algoCounter = 1;
  for (var fi = 0; fi < fingerings.length; fi++) {
    if (!fingerings[fi]._fromDb) {
      fingerings[fi].name = '指法 #' + algoCounter;
      algoCounter++;
    }
  }

  // 最多返回20个指法
  if (fingerings.length > 20) {
    fingerings = fingerings.slice(0, 20);
  }

  // 清理内部标记
  for (var fi2 = 0; fi2 < fingerings.length; fi2++) {
    fingerings[fi2]._fromDb = null;
    fingerings[fi2]._dbIndex = null;
  }

  return {
    root: root,
    type: type,
    chordName: chordName,
    chordNotes: chordInfo.notes,
    fingerings: fingerings,
    totalCount: fingerings.length,
  };
}

module.exports = {
  OPEN_STRINGS: OPEN_STRINGS,
  getNoteAtFret: getNoteAtFret,
  getChordPositionsOnString: getChordPositionsOnString,
  findAllFingerings: findAllFingerings,
  getChordFingerings: getChordFingerings,
};
