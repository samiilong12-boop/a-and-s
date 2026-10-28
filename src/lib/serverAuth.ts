import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'raheeq-luxury-super-secret-key-2026-cairo-fragrance-atelier'
);

export const ADMIN_COOKIE_NAME = 'raheeq_admin_session';

export async function createAdminToken(): Promise<string> {
  return await new SignJWT({ role: 'admin', authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyTokenString(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'admin' && payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function verifyAdminSession(req?: Request): Promise<boolean> {
  try {
    // 1. Check Authorization header (Bearer token)
    if (req) {
      const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token && (await verifyTokenString(token))) {
          return true;
        }
      }
    }

    // 2. Check HTTP-only cookie via next/headers
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
      if (cookie?.value && (await verifyTokenString(cookie.value))) {
        return true;
      }
    } catch {
      // Cookies may throw in certain server contexts, continue to check req cookies
    }

    // 3. Fallback to parsing Cookie header from Request
    if (req) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]*)`));
      if (match && match[1]) {
        const tokenVal = decodeURIComponent(match[1]);
        if (await verifyTokenString(tokenVal)) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}
