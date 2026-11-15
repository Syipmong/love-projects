import crypto from 'node:crypto';

const ALPHANUMERIC_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 characters, excluding 0, 1, O, I for clarity

/**
 * Generates a clean, unambiguous 6-character alphanumeric code
 * Examples: 'K7X9B2', '8MN4PQ', '3Y6TR9'
 */
export function generate6CharAlphaNumericCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHANUMERIC_CHARS[bytes[i] % ALPHANUMERIC_CHARS.length];
  }
  return code;
}
