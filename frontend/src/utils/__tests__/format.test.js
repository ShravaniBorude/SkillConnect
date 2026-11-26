import { describe, it, expect } from 'vitest';
import { formatCurrency, truncate, getInitials } from '../format';

describe('format utils', () => {
  it('formats INR currency properly', () => {
    expect(formatCurrency(5000)).toBe('₹5,000');
    expect(formatCurrency(null)).toBe('-');
  });

  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…');
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('extracts user initials', () => {
    expect(getInitials('Shrvan Kumar')).toBe('SK');
    expect(getInitials('')).toBe('?');
  });
});
