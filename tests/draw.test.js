const { drawFretboard } = require('../utils/draw');

describe('draw', () => {
  describe('drawFretboard', () => {
    test('does not throw with valid options', () => {
      const mockCtx = {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn(),
      };

      expect(() => {
        drawFretboard(mockCtx, {
          width: 350,
          height: 280,
          maxFret: 5,
          fingerings: [],
          currentIndex: 0,
        });
      }).not.toThrow();

      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    test('draws with fingerings does not throw', () => {
      const mockCtx = {
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        fillText: jest.fn(),
      };

      const sampleFingering = {
        strings: Array.from({ length: 6 }, (_, i) => ({
          string: i,
          fret: i === 0 ? 'x' : i,
          note: 'C',
          label: i === 0 ? 'X' : String(i),
        })),
      };

      expect(() => {
        drawFretboard(mockCtx, {
          width: 350,
          height: 280,
          maxFret: 5,
          fingerings: [sampleFingering],
          currentIndex: 0,
        });
      }).not.toThrow();
    });
  });
});
