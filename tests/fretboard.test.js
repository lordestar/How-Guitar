const {
  getNoteAtFret,
  getChordPositionsOnString,
  findAllFingerings,
  getChordFingerings,
  calcFretSpan,
  isFingeringReasonable,
} = require('../utils/fretboard');

describe('fretboard', () => {
  describe('getNoteAtFret', () => {
    test('E string (6th) fret 5 => E open +5 = A', () => {
      const result = getNoteAtFret(0, 5);
      expect(result.name).toBe('A');
      expect(result.value).toBe(9);
    });

    test('E string fret 0 => E', () => {
      const result = getNoteAtFret(0, 0);
      expect(result.name).toBe('E');
    });
  });

  describe('getChordPositionsOnString', () => {
    test('E string with C major notes [0,4,7] at maxFret 5', () => {
      const result = getChordPositionsOnString(0, [0, 4, 7], 5);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findAllFingerings', () => {
    test('C major returns at least one fingering', () => {
      const result = findAllFingerings([0, 4, 7]);
      expect(result.length).toBeGreaterThan(0);
    });

    test('each fingering has 6 positions', () => {
      const result = findAllFingerings([0, 4, 7]);
      const first = result[0];
      expect(first.positions.length).toBe(6);
    });
  });

  describe('getChordFingerings', () => {
    test('C major returns fingerings with chordName', () => {
      const result = getChordFingerings('C', 'major');
      expect(result.error).toBeUndefined();
      expect(result.chordName).toBe('C');
      expect(result.fingerings.length).toBeGreaterThan(0);
      expect(result.totalCount).toBeGreaterThan(0);
    });

    test('C major returns database fingering (open C) first', () => {
      const result = getChordFingerings('C', 'major');
      const firstStrings = result.fingerings[0].strings;
      expect(firstStrings[0].fret).toBe('x');
      expect(firstStrings[1].fret).toBe(3);
      expect(firstStrings[2].fret).toBe(2);
    });

    test('Am returns fingerings', () => {
      const result = getChordFingerings('A', 'm');
      expect(result.error).toBeUndefined();
      expect(result.fingerings.length).toBeGreaterThan(0);
    });

    test('unsupported type returns error', () => {
      const result = getChordFingerings('C', 'unknown_type');
      expect(result.error).toBeDefined();
    });
  });

  describe('calcFretSpan', () => {
    test('open C span', () => {
      const openC = [
        { fret: 'x' }, { fret: 3 }, { fret: 2 }, { fret: 0 }, { fret: 1 }, { fret: 0 },
      ];
      expect(calcFretSpan(openC)).toBe(3);
    });
  });

  describe('isFingeringReasonable', () => {
    test('open C is reasonable', () => {
      const openC = [
        { fret: 'x' }, { fret: 3 }, { fret: 2 }, { fret: 0 }, { fret: 1 }, { fret: 0 },
      ];
      expect(isFingeringReasonable(openC)).toBe(true);
    });

    test('hole in middle is not reasonable', () => {
      const holed = [
        { fret: 1 }, { fret: 'x' }, { fret: 1 }, { fret: 3 }, { fret: 2 }, { fret: 1 },
      ];
      expect(isFingeringReasonable(holed)).toBe(false);
    });
  });
});
