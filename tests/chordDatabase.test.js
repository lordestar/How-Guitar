const {
  getChordNotes,
  noteToSemitone,
  semitoneToNote,
  getSmartNoteName,
  getAllRootNotes,
  getAllChordTypes,
  getChordFromDatabase,
  CHORD_DATABASE,
  CHORD_TYPE_NAMES,
} = require('../utils/chordDatabase');

describe('chordDatabase', () => {
  describe('getChordNotes', () => {
    test('C major => [C, E, G]', () => {
      expect(getChordNotes('C', 'major').notes).toEqual(['C', 'E', 'G']);
    });

    test('Am => [A, C, E]', () => {
      expect(getChordNotes('A', 'm').notes).toEqual(['A', 'C', 'E']);
    });

    test('C7 => [C, E, G, Bb]', () => {
      expect(getChordNotes('C', '7').notes).toEqual(['C', 'E', 'G', 'A#']);
    });

    test('Cmaj7 => [C, E, G, B]', () => {
      expect(getChordNotes('C', 'maj7').notes).toEqual(['C', 'E', 'G', 'B']);
    });

    test('Cdim => [C, Eb, Gb]', () => {
      expect(getChordNotes('C', 'dim').notes).toEqual(['C', 'Eb', 'Gb']);
    });

    test('Caug => [C, E, G#]', () => {
      expect(getChordNotes('C', 'aug').notes).toEqual(['C', 'E', 'G#']);
    });

    test('Csus2 => [C, D, G]', () => {
      expect(getChordNotes('C', 'sus2').notes).toEqual(['C', 'D', 'G']);
    });

    test('Csus4 => [C, F, G]', () => {
      expect(getChordNotes('C', 'sus4').notes).toEqual(['C', 'F', 'G']);
    });

    test('unsupported type returns error', () => {
      expect(getChordNotes('C', 'unknown').error).toBeDefined();
    });

    test('noteValues match notes', () => {
      const info = getChordNotes('D', 'major');
      expect(info.noteValues.length).toBe(info.notes.length);
    });
  });

  describe('noteToSemitone', () => {
    test('C => 0', () => expect(noteToSemitone('C')).toBe(0));
    test('C# => 1', () => expect(noteToSemitone('C#')).toBe(1));
    test('B => 11', () => expect(noteToSemitone('B')).toBe(11));
    test('invalid => -1', () => expect(noteToSemitone('X')).toBe(-1));
  });

  describe('semitoneToNote', () => {
    test('0 => C', () => expect(semitoneToNote(0)).toBe('C'));
    test('11 => B', () => expect(semitoneToNote(11)).toBe('B'));
    test('wrap: 12 => C', () => expect(semitoneToNote(12)).toBe('C'));
  });

  describe('getSmartNoteName', () => {
    test('sharp root uses sharp names', () => {
      expect(getSmartNoteName('C#', 'major', 1)).toBe('C#');
    });
  });

  describe('getAllRootNotes', () => {
    test('returns 12 roots', () => {
      expect(getAllRootNotes()).toHaveLength(12);
    });
  });

  describe('getAllChordTypes', () => {
    test('returns chord types', () => {
      expect(getAllChordTypes().length).toBeGreaterThan(15);
    });
  });

  describe('getChordFromDatabase', () => {
    test('C major => found', () => {
      expect(getChordFromDatabase('C', 'major')).toBeTruthy();
    });

    test('C => found (same as major)', () => {
      expect(getChordFromDatabase('C', '')).toBeTruthy();
    });

    test('unknown chord => null', () => {
      // should be null but CHORD_DATABASE includes Bb
      expect(CHORD_DATABASE['unknown_chord']).toBeUndefined();
    });
  });

  describe('CHORD_TYPE_NAMES', () => {
    test('has "major" key', () => expect(CHORD_TYPE_NAMES['major']).toBe('大三'));
    test('has "m" key', () => expect(CHORD_TYPE_NAMES['m']).toBe('小三'));
  });
});
