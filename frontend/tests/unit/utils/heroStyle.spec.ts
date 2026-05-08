import { heroStyle } from '@/utils/heroStyle';

describe('heroStyle', () => {
  it('returns an object with a background property', () => {
    const result = heroStyle(1);
    expect(result).toHaveProperty('background');
  });

  it('produces a linear-gradient string', () => {
    const { background } = heroStyle(1);
    expect(background).toMatch(/^linear-gradient/);
  });

  it('derives hue deterministically from id', () => {
    expect(heroStyle(5)).toEqual(heroStyle(5));
  });

  it('produces different gradients for different ids', () => {
    expect(heroStyle(1).background).not.toBe(heroStyle(2).background);
  });

  it('wraps hue within 0–359', () => {
    // id=6 → hue = (6*67)%360 = 42, secondary = 82
    const { background } = heroStyle(6);
    expect(background).toContain('hsl(42,');
    expect(background).toContain('hsl(82,');
  });

  it('handles id=0 without errors', () => {
    expect(() => heroStyle(0)).not.toThrow();
  });

  it('handles large ids without errors', () => {
    expect(() => heroStyle(999999)).not.toThrow();
  });
});
