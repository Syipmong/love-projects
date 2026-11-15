import crypto from 'node:crypto';

// In-memory token store mapped to user IDs
const tokenStore = new Map<string, { userId: string; email: string; expiresAt: number }>();

/**
 * Hashes password using crypto scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates an authentication token valid for 30 days
 */
export function createSessionToken(userId: string, email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  tokenStore.set(token, { userId, email, expiresAt });
  return token;
}

/**
 * Validates session token
 */
export function validateSessionToken(token: string): { userId: string; email: string } | null {
  const session = tokenStore.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    tokenStore.delete(token);
    return null;
  }
  return { userId: session.userId, email: session.email };
}

