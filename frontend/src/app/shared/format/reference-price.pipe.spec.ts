import { ReferencePricePipe } from './reference-price.pipe';

const normalizeSpaces = (text: string) => text.replace(/\s/g, ' ');

describe('ReferencePricePipe', () => {
  const pipe = new ReferencePricePipe();

  it('formats a COP reference price without decimals', () => {
    expect(normalizeSpaces(pipe.transform(120000))).toBe('Desde $ 120.000 COP');
  });

  it('formats millions with thousand separators', () => {
    expect(normalizeSpaces(pipe.transform(1500000))).toBe('Desde $ 1.500.000 COP');
  });

  it('returns an empty string when there is no price', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
