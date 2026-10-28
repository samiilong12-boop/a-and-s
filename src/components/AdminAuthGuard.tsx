'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Crown,
  Clock,
  ShieldAlert,
} from 'lucide-react';

const STORAGE_KEY = 'a_and_s_admin_session_auth';
const TOKEN_KEY = 'a_and_s_admin_jwt_token';
const LAST_ACTIVITY_KEY = 'a_and_s_admin_last_activity';
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAutoLocked, setWasAutoLocked] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/images/raheeq-official-logo.png');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('raheeq_site_content_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.brandLogoUrl) setLogoUrl(parsed.brandLogoUrl);
      }
    } catch {}
  }, []);

  const lastActivityRef = useRef<number>(Date.now());
  const timerCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-lock handler
  const lockDueToInactivity = useCallback(async () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);

      // Call server to expire cookie
      await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setWasAutoLocked(true);
    setPasswordInput('');
  }, []);

  // Update activity timestamp
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      sessionStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    } catch {
      // ignore
    }
  }, []);

  // Initial authentication check & auto-lock timeout check on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuthStatus() {
      try {
        const savedActivity =
          sessionStorage.getItem(LAST_ACTIVITY_KEY) || localStorage.getItem(LAST_ACTIVITY_KEY);
        const lastTime = savedActivity ? parseInt(savedActivity, 10) : Date.now();
        const diff = Date.now() - lastTime;

        if (diff > INACTIVITY_TIMEOUT_MS) {
          if (isMounted) lockDueToInactivity();
          return;
        }

        // Verify with server
        const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/auth', {
          method: 'GET',
          headers,
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.authenticated) {
              lastActivityRef.current = Date.now();
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          }
        } else {
          if (isMounted) setIsAuthenticated(false);
        }
      } catch {
        if (isMounted) setIsAuthenticated(false);
      }
    }

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [lockDueToInactivity]);

  // Set up 10-minute inactivity tracker when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (timerCheckRef.current) clearInterval(timerCheckRef.current);
      return;
    }

    recordActivity();

    // Activity event listeners
    const handleUserActivity = () => {
      recordActivity();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 5 seconds
    timerCheckRef.current = setInterval(() => {
      const diff = Date.now() - lastActivityRef.current;
      if (diff >= INACTIVITY_TIMEOUT_MS) {
        lockDueToInactivity();
      }
    }, 5000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerCheckRef.current) clearInterval(timerCheckRef.current);
    };
  }, [isAuthenticated, lockDueToInactivity, recordActivity]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setWasAutoLocked(false);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        const now = Date.now();
        try {
          sessionStorage.setItem(STORAGE_KEY, 'authenticated');
          sessionStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(STORAGE_KEY, 'authenticated');
          localStorage.setItem(TOKEN_KEY, data.token);
          sessionStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
        } catch {
          // ignore
        }
        lastActivityRef.current = now;
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setErrorMessage(data.error || 'رمز المرور غير صحيح. يرجى إدخال رمز المرور المعتمد لمالك المتجر.');
      }
    } catch {
      setErrorMessage('تعذر الاتصال بخادم المصادقة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await lockDueToInactivity();
    setWasAutoLocked(false);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#080A0A] flex items-center justify-center text-[#54d1b2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#54d1b2] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#E6E1D5]">
            التحقق الأمني المشفر لدار رحيق (Raheeq Cryptographic Guard)...
          </span>
        </div>
      </div>
    );
  }

  // If Not Authenticated, render Ultra-Luxury Raheeq Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080A0A] text-[#FAF9F5] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#00bc7d]/15 via-[#54d1b2]/10 to-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[#A2ADA9] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للمتجر الرئيسي (Return to Store)</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>بوابة الإدارة السيرفرية المشفرة (Server-Verified)</span>
          </div>
        </div>

        {/* Center Login Card */}
        <div className="max-w-md w-full mx-auto my-auto relative z-10 py-10">
          <div className="bg-[#0D1212] border border-[#54d1b2]/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(84,209,178,0.12)] space-y-6">
            {/* Logo Crest */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-[#080A0A] border border-[#54d1b2]/40 mx-auto flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src={logoUrl}
                  alt="Raheeq Haute Parfumerie"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-[0.2em] text-white">رَحِـيـقْ | RAHEEQ</h1>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold mt-0.5">
                  Haute Parfumerie • Private Admin Gateway
                </p>
              </div>
              <p className="text-xs text-[#A2ADA9] max-w-xs mx-auto leading-relaxed">
                لوحة التحكم المركزية لإدارة عطور الدار، متابعة أرباح المبيعات، ومراجعة طلبات التوصيل.
              </p>
            </div>

            {/* Inactivity Auto-Lock Notice */}
            {wasAutoLocked && (
              <div className="bg-amber-950/70 border border-amber-500/60 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 animate-in fade-in">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-amber-300">تم قفل اللوحة تلقائياً (Auto-Locked)</strong>
                  <span>لحماية متجرك، تم قفل لوحة التحكم بعد مرور 10 دقائق من عدم النشاط. يرجى إدخال رمز المرور للمتابعة.</span>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-500/50 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-200 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#E6E1D5] uppercase tracking-wider mb-2">
                  رمز المرور الخاص (Master Admin Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#788784]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="أدخل رمز المرور السري..."
                    required
                    autoFocus
                    className="w-full bg-[#141B1A] border border-white/15 focus:border-[#54d1b2] rounded-xl pr-10 pl-11 py-3 text-sm text-white placeholder-[#788784] focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#788784] hover:text-[#54d1b2] transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:from-[#54d1b2] hover:to-[#00bc7d] text-[#080A0A] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(84,209,178,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري التحقق بالسيرفر...' : 'دخول إلى لوحة التحكم'}</span>
              </button>
            </form>

            {/* Security Notice */}
            <div className="border-t border-white/10 pt-4 text-center space-y-1">
              <span className="text-[11px] text-[#788784] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#54d1b2]" />
                <span>مصادقة سيرفرية مشفرة (JWT + HttpOnly Cookie)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[#788784] relative z-10 py-2">
          © {new Date().getFullYear()} رَحِيق (Raheeq Haute Parfumerie). All Rights Reserved.
        </div>
      </div>
    );
  }

  // When Authenticated, wrap children with Admin session context and logout button
  return (
    <div className="relative">
      {/* Dynamic Global Logout Ribbon available in Admin Header */}
      <div className="bg-[#080A0A] text-[#FAF9F5] px-4 py-1.5 border-b border-white/10 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00bc7d] animate-ping" />
          <span className="text-[11px] text-[#A2ADA9]">
            جلسة الإدارة نشطة ومشفرة — مرحباً بمالك دار رحيق (قفل تلقائي بعد 10 دقائق من عدم النشاط)
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] text-rose-400 hover:text-rose-300 font-bold hover:underline transition-colors flex items-center gap-1"
        >
          <Lock className="w-3 h-3" />
          <span>قفل اللوحة والخروج (Lock Portal)</span>
        </button>
      </div>

      {children}
    </div>
  );
}
