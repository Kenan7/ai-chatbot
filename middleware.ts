import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';

const TOKEN_VERSION = 'v1';
const COOKIE_NAME = 'admin_session';
const DEFAULT_TTL_HOURS = 12;

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    const h = bytes[i].toString(16).padStart(2, '0');
    hex += h;
  }
  return hex;
}

async function signEdge(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return toHex(sig);
}

async function validateCookieEdge(cookie: string | undefined, secret: string): Promise<boolean> {
  if (!cookie) return false;
  const parts = cookie.split('.');
  if (parts.length !== 3) return false;
  const [version, expStr, sig] = parts;
  if (version !== TOKEN_VERSION) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  if (Date.now() > exp) return false;
  const expected = await signEdge(secret, `${TOKEN_VERSION}.${exp}`);
  // constant time compare
  if (expected.length !== sig.length) return false;
  let valid = 0;
  for (let i = 0; i < expected.length; i++) {
    valid |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return valid === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check for Playwright
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // Skip auth for auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Admin gate: Basic auth with ADMIN_KEY → signed cookie issuance
  if (pathname.startsWith('/admin')) {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) {
      return new NextResponse('Server misconfigured: ADMIN_KEY not set', { status: 500 });
    }

    const cookie = request.cookies.get(COOKIE_NAME)?.value;
    const hasValidCookie = await validateCookieEdge(cookie, adminKey);
    if (hasValidCookie) {
      return NextResponse.next();
    }

    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      });
    }

    try {
      const base64 = auth.slice(6);
      const decoded = globalThis.atob(base64);
      const sepIndex = decoded.indexOf(':');
      const password = sepIndex >= 0 ? decoded.slice(sepIndex + 1) : decoded;

      if (password !== adminKey) {
        return new NextResponse('Unauthorized', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
        });
      }

      const ttlHours = Number(process.env.ADMIN_COOKIE_TTL_HOURS || DEFAULT_TTL_HOURS);
      const exp = Date.now() + Math.max(1, ttlHours) * 60 * 60 * 1000;
      const sig = await signEdge(adminKey, `${TOKEN_VERSION}.${exp}`);
      const token = `${TOKEN_VERSION}.${exp}.${sig}`;

      const res = NextResponse.next();
      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: Math.floor((exp - Date.now()) / 1000),
      });
      return res;
    } catch {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      });
    }
  }

  // App auth gate (guest redirect, login/register guards)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url),
    );
  }

  const isGuest = guestRegex.test(token?.email ?? '');
  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',
    // Match everything except Next internals and common public assets
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
