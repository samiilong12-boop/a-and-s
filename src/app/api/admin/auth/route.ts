import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminToken, verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/serverAuth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0913982509M';

function timingSafePasswordCheck(input: string, target: string): boolean {
  try {
    const a = Buffer.from(input.trim(), 'utf-8');
    const b = Buffer.from(target.trim(), 'utf-8');
    if (a.length !== b.length) {
      crypto.timingSafeEqual(a, a); // constant time dummy
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAuthenticated = await verifyAdminSession(req);
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit login attempts: max 5 attempts per minute per IP
    const rateCheck = checkRateLimit(`login_${clientIp}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'تم تجاوز عدد محاولات الدخول المسموح بها، يرجى المحاولة بعد دقيقة.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'كلمة المرور مطلوبة' }, { status: 400 });
    }

    if (!timingSafePasswordCheck(password, ADMIN_PASSWORD)) {
      return NextResponse.json(
        { success: false, error: 'رمز المرور غير صحيح، يرجى المحاولة مرة أخرى.' },
        { status: 401 }
      );
    }

    const token = await createAdminToken();

    const response = NextResponse.json({
      success: true,
      token,
      message: 'تم تسجيل الدخول بنجاح',
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
