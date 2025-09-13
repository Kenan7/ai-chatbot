import crypto from 'crypto';

const TOKEN_VERSION = 'v1';
const COOKIE_NAME = 'admin_session';

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function verifyAdminToken(token: string | undefined): boolean {
  try {
    if (!token) return false;
    const secret = process.env.ADMIN_KEY;
    if (!secret) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [version, expStr, sig] = parts;
    if (version !== TOKEN_VERSION) return false;

    const exp = Number(expStr);
    if (!Number.isFinite(exp)) return false;
    if (Date.now() > exp) return false;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${TOKEN_VERSION}.${exp}`);
    const expected = hmac.digest('hex');

    // Constant-time compare
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(sig, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}