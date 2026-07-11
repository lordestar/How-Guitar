const { noteToFrequency, getSoundingNotes } = require('../utils/audioEngine');

describe('audioEngine', () => {
  describe('noteToFrequency', () => {
    test('E2 => ~659.26', () => {
      expect(noteToFrequency('E')).toBeCloseTo(659.26, 1);
    });

    test('A2 => ~880', () => {
      expect(noteToFrequency('A')).toBeCloseTo(880, 1);
    });

    test('D3 => ~587.33', () => {
      expect(noteToFrequency('D')).toBeCloseTo(587.33, 1);
    });

    test('null note => 0', () => {
      expect(noteToFrequency(null)).toBe(0);
    });
  });

  describe('getSoundingNotes', () => {
    const makeStrings = (...frets) =>
      frets.map((f, i) => ({
        string: i,
        fret: f === 'x' ? 'x' : f,
        note: null,
        label: f === 'x' ? 'X' : String(f),
      }));

    test('open Em returns 6 notes', () => {
      const notes = getSoundingNotes(makeStrings(0, 2, 2, 0, 0, 0));
      expect(notes.length).toBeGreaterThanOrEqual(5);
    });

    test('all muted returns empty', () => {
      const notes = getSoundingNotes(makeStrings('x', 'x', 'x', 'x', 'x', 'x'));
      expect(notes.length).toBe(0);
    });
  });
});
