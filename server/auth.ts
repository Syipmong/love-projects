import crypto from 'node:crypto';

// Secret key for cryptographic session verification across server restarts
const SESSION_SECRET = process.env.SESSION_SECRET || 'aetech-love-proposal-persistent-hmac-secret-2025-strict';

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

interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

/**
 * Generates an authentication token valid for 60 days.
 * Uses HMAC-SHA256 signature so sessions persist across refreshes, server restarts, and cold starts!
 */
export function createSessionToken(userId: string, email: string): string {
  const payload: SessionPayload = {
    userId,
    email,
    exp: Date.now() + 60 * 24 * 60 * 60 * 1000 // 60 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Validates session token cryptographically.
 * Never drops user session on page refresh or server restart.
 */
export function validateSessionToken(token: string): { userId: string; email: string } | null {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.userId || !payload.email || typeof payload.exp !== 'number') {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

