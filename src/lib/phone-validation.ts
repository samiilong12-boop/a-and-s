/**
 * Egyptian Mobile Phone Validation (Section 0)
 * Valid Egyptian mobile numbers must:
 * - Contain 11 digits
 * - Start with '01' followed by 0, 1, 2, or 5 (e.g. 010, 011, 012, 015)
 * - May be input with leading +20 or 20, which is normalized.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
  errorMessage?: string;
}

export function validateEgyptianPhone(rawInput: string): PhoneValidationResult {
  if (!rawInput) {
    return {
      isValid: false,
      normalizedPhone: '',
      errorMessage: 'Phone number is required',
    };
  }

  // Strip spaces, dashes, parentheses
  let cleaned = rawInput.replace(/[\s\-\(\)]/g, '');

  // Strip international prefixes (+20 or 0020 or 20)
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  }

  // Regex check for 11 digits starting with 010, 011, 012, 015
  const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;

  if (!egyptianPhoneRegex.test(cleaned)) {
    return {
      isValid: false,
      normalizedPhone: cleaned,
      errorMessage: 'Please enter a valid 11-digit Egyptian mobile number (e.g., 01012345678, 011..., 012..., 015...)',
    };
  }

  return {
    isValid: true,
    normalizedPhone: cleaned,
  };
}
