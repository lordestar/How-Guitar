const { getChordExplanation } = require('../utils/chordExplanations');

describe('chordExplanations', () => {
  describe('getChordExplanation', () => {
    test('C major => specific chord info', () => {
      const result = getChordExplanation('C', 'major');
      expect(result).toBeTruthy();
      expect(result.role).toBeDefined();
      expect(result.feeling).toBeDefined();
    });

    test('Am (m type) => specific chord info', () => {
      const result = getChordExplanation('A', 'm');
      expect(result).toBeTruthy();
      expect(result.role).toBeDefined();
    });

    test('C7 => specific chord info', () => {
      const result = getChordExplanation('C', '7');
      expect(result).toBeTruthy();
      expect(result.role).toBeDefined();
    });

    test('unknown type returns null', () => {
      const result = getChordExplanation('H', 'xyz');
      expect(result).toBeNull();
    });

    test('sus2 type falls back to generic explanation', () => {
      const result = getChordExplanation('F#', 'sus2');
      expect(result).toBeTruthy();
      expect(result.role).toBeDefined();
    });
  });
});
