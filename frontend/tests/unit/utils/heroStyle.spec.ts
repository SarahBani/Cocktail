import { heroStyle } from '@/utils/heroStyle';
import { HUE_MULTIPLIER, HUE_OFFSET, HUE_RANGE } from '@/constants';

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

  it('uses the correct hue values derived from constants', () => {
    const id = 6;
    const expectedHue = (id * HUE_MULTIPLIER) % HUE_RANGE;
    const expectedSecondary = (expectedHue + HUE_OFFSET) % HUE_RANGE;
    const { background } = heroStyle(id);
    expect(background).toContain(`hsl(${expectedHue},`);
    expect(background).toContain(`hsl(${expectedSecondary},`);
  });

  it('handles id=0 without errors', () => {
    expect(() => heroStyle(0)).not.toThrow();
  });

  it('handles large ids without errors', () => {
    expect(() => heroStyle(999999)).not.toThrow();
  });
});
