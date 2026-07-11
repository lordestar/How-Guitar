const {
  freqToNote,
  calcCents,
  centsToAngle,
  smoothEMA,
  medianOfBuffer,
  detectPitch,
} = require('../utils/pitch');

describe('pitch', () => {
  describe('freqToNote', () => {
    test('440Hz => A4', () => {
      const result = freqToNote(440);
      expect(result.name).toBe('A4');
    });

    test('261.63Hz => C4', () => {
      const result = freqToNote(261.63);
      expect(result.name).toBe('C4');
    });

    test('82.41Hz => E2', () => {
      const result = freqToNote(82.41);
      expect(result.name).toBe('E2');
    });

    test('zero freq => --', () => {
      const result = freqToNote(0);
      expect(result.name).toBe('--');
    });
  });

  describe('calcCents', () => {
    test('440 vs 440 => 0', () => {
      expect(calcCents(440, 440)).toBeCloseTo(0, 1);
    });

    test('442 vs 440 => ~+7.85', () => {
      expect(calcCents(442, 440)).toBeCloseTo(7.85, 1);
    });

    test('438 vs 440 => ~-7.89', () => {
      expect(calcCents(438, 440)).toBeCloseTo(-7.89, 1);
    });

    test('zero freq => 0', () => {
      expect(calcCents(0, 440)).toBe(0);
    });
  });

  describe('centsToAngle', () => {
    test('0 cents => 0 degrees', () => {
      expect(centsToAngle(0)).toBeCloseTo(0);
    });

    test('+50 cents => 90 degrees', () => {
      expect(centsToAngle(50)).toBeCloseTo(90);
    });

    test('-50 cents => -90 degrees', () => {
      expect(centsToAngle(-50)).toBeCloseTo(-90);
    });

    test('+100 cents => clamped to 90', () => {
      expect(centsToAngle(100)).toBeCloseTo(90);
    });
  });

  describe('smoothEMA', () => {
    test('basic smoothing', () => {
      expect(smoothEMA(10, 0, 0.3)).toBeCloseTo(3);
    });

    test('null prev returns value', () => {
      expect(smoothEMA(5, null, 0.3)).toBe(5);
    });
  });

  describe('medianOfBuffer', () => {
    test('odd length', () => {
      expect(medianOfBuffer([1, 5, 3])).toBe(3);
    });

    test('even length', () => {
      expect(medianOfBuffer([1, 4, 2, 3])).toBe(2.5);
    });

    test('empty => 0', () => {
      expect(medianOfBuffer([])).toBe(0);
    });
  });

  describe('detectPitch', () => {
    test('null for short input', () => {
      expect(detectPitch(new Float32Array(10), 44100)).toBeNull();
    });

    test('null for low amplitude noise', () => {
      const noise = new Float32Array(2048);
      for (let i = 0; i < noise.length; i++) {
        noise[i] = (Math.random() * 2 - 1) * 0.001;
      }
      expect(detectPitch(noise, 44100)).toBeNull();
    });

    test('detects 440Hz sine', () => {
      const sampleRate = 44100;
      const samples = new Float32Array(4096);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.8;
      }
      const result = detectPitch(samples, sampleRate);
      expect(result).not.toBeNull();
      expect(result.frequency).toBeGreaterThan(100);
      expect(result.frequency).toBeLessThan(500);
      expect(result.confidence).toBeGreaterThan(0.2);
    });
  });
});
