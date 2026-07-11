const {
  semitoneToFreq,
  semitoneToNote,
  getTuningById,
  getAllPresets,
  isNoteInSafeRange,
  getValidSemitonesForString,
} = require('../utils/tuningPresets');

describe('tuningPresets', () => {
  describe('semitoneToFreq', () => {
    test('A4(69) => 440Hz', () => {
      expect(semitoneToFreq(69)).toBeCloseTo(440, 1);
    });

    test('E2(40) => 82.41Hz', () => {
      expect(semitoneToFreq(40)).toBeCloseTo(82.41, 1);
    });
  });

  describe('semitoneToNote', () => {
    test('69 => A4', () => {
      expect(semitoneToNote(69)).toBe('A4');
    });

    test('40 => E2', () => {
      expect(semitoneToNote(40)).toBe('E2');
    });
  });

  describe('getTuningById', () => {
    test('standard => 6 strings', () => {
      expect(getTuningById('standard').strings).toHaveLength(6);
    });

    test('unknown => null', () => {
      expect(getTuningById('nonexistent')).toBeNull();
    });
  });

  describe('getAllPresets', () => {
    test('returns 7 presets', () => {
      expect(getAllPresets()).toHaveLength(7);
    });
  });

  describe('isNoteInSafeRange', () => {
    test('string 6, semitone 40 => safe', () => {
      expect(isNoteInSafeRange(6, 40)).toBe(true);
    });

    test('string 6, semitone 50 => unsafe', () => {
      expect(isNoteInSafeRange(6, 50)).toBe(false);
    });
  });

  describe('getValidSemitonesForString', () => {
    test('string 6 returns range', () => {
      const range = getValidSemitonesForString(6);
      expect(range.length).toBeGreaterThan(5);
      expect(range).toContain(40);
    });
  });
});
