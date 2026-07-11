// ============ utils/fretboardData.js ============
// 指板数据抽象层 — 统一和弦与音阶的数据模型
// 提供标准化的 StringPosition 和 Fingering 数据结构
// 未来扩展音阶模式时，可复用本模块的数据规约

/**
 * @typedef {Object} StringPosition
 * @property {number} string - 弦索引 (0=6弦, 5=1弦)
 * @property {number|string} fret - 品数 (0=空弦, 'x'=制音)
 * @property {string|null} note - 音名
 * @property {number|undefined} noteValue - 半音值 (0-11)
 * @property {string} label - 显示标签 (品数 / 'O' / 'X')
 * @property {boolean|undefined} isOpen - 是否空弦
 */

/**
 * @typedef {Object} Fingering
 * @property {string} name - 指法名称
 * @property {import('./fretboardData').StringPosition[]} strings - 6根弦的位置
 */

/**
 * @typedef {Object} NormalizedFingering
 * @property {string} name - 指法名称
 * @property {import('./fretboardData').StringPosition[]} strings - 6根弦的位置
 * @property {number} soundingCount - 发声音符数
 * @property {number} openCount - 空弦数
 * @property {number} mutedCount - 制音弦数
 * @property {number} minFret - 最低按品
 * @property {number} maxFret - 最高按品
 * @property {number} fretSpan - 品数跨度
 * @property {number[]} soundingNotes - 发声音符的半音值数组
 */

/**
 * 将原始指法数据标准化为 NormalizedFingering
 * @param {Object} fingering - 原始指法对象
 * @param {import('./fretboardData').StringPosition[]} fingering.strings
 * @param {string} fingering.name
 * @returns {import('./fretboardData').NormalizedFingering}
 */
function normalizeFingering(fingering) {
  const strings = fingering.strings || [];
  let soundingCount = 0;
  let openCount = 0;
  let mutedCount = 0;
  let minFret = Infinity;
  let maxFret = 0;
  const soundingNotes = [];

  for (let i = 0; i < strings.length; i++) {
    const st = strings[i];
    if (!st) continue;

    if (st.fret === 'x' || st.fret === null || st.fret === undefined) {
      mutedCount++;
      continue;
    }

    const fret = parseInt(st.fret, 10);
    if (isNaN(fret)) {
      mutedCount++;
      continue;
    }

    soundingCount++;
    if (fret === 0) {
      openCount++;
    } else {
      if (fret < minFret) minFret = fret;
      if (fret > maxFret) maxFret = fret;
    }

    if (st.noteValue !== undefined && st.noteValue !== null) {
      soundingNotes.push(st.noteValue);
    }
  }

  if (minFret === Infinity) minFret = 0;
  const fretSpan = maxFret - minFret;

  return {
    name: fingering.name || '',
    strings: strings,
    soundingCount,
    openCount,
    mutedCount,
    minFret,
    maxFret,
    fretSpan,
    soundingNotes,
  };
}

/**
 * 判断两个指法是否相似（仅 1 个位置不同）
 * @param {import('./fretboardData').StringPosition[]} a
 * @param {import('./fretboardData').StringPosition[]} b
 * @returns {boolean}
 */
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

module.exports = {
  normalizeFingering,
  fingeringsSimilar,
};
