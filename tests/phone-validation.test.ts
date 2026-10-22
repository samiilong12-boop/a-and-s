import { describe, it, expect } from 'vitest';
import { validateEgyptianPhone } from '../src/lib/phone-validation';

describe('Egyptian Mobile Phone Validation (Section 0)', () => {
  it('accepts valid 11-digit Egyptian mobile numbers starting with 010, 011, 012, 015', () => {
    expect(validateEgyptianPhone('01012345678').isValid).toBe(true);
    expect(validateEgyptianPhone('01198765432').isValid).toBe(true);
    expect(validateEgyptianPhone('01234567890').isValid).toBe(true);
    expect(validateEgyptianPhone('01555555555').isValid).toBe(true);
  });

  it('normalizes international prefixes (+20, 0020, 20)', () => {
    const res1 = validateEgyptianPhone('+201012345678');
    expect(res1.isValid).toBe(true);
    expect(res1.normalizedPhone).toBe('01012345678');

    const res2 = validateEgyptianPhone('00201198765432');
    expect(res2.isValid).toBe(true);
    expect(res2.normalizedPhone).toBe('01198765432');

    const res3 = validateEgyptianPhone('201234567890');
    expect(res3.isValid).toBe(true);
    expect(res3.normalizedPhone).toBe('01234567890');
  });

  it('cleans whitespace, dashes, and parentheses', () => {
    const res = validateEgyptianPhone('010 1234 - 5678');
    expect(res.isValid).toBe(true);
    expect(res.normalizedPhone).toBe('01012345678');
  });

  it('rejects invalid lengths and operators', () => {
    // 10 digits
    expect(validateEgyptianPhone('0101234567').isValid).toBe(false);
    // 12 digits
    expect(validateEgyptianPhone('010123456789').isValid).toBe(false);
    // Invalid operator (013, 014, 017)
    expect(validateEgyptianPhone('01312345678').isValid).toBe(false);
    expect(validateEgyptianPhone('01412345678').isValid).toBe(false);
    // Landline
    expect(validateEgyptianPhone('0227654321').isValid).toBe(false);
  });
});
