'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, Home, Trash2, ArrowLeft } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely to console for debugging
    console.error('Raheeq Admin Encountered Client-Side Exception:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      // Clear potentially corrupted demo cache while preserving brand identity
      sessionStorage.removeItem('a_and_s_admin_session_auth');
      sessionStorage.removeItem('a_and_s_admin_jwt_token');
      sessionStorage.removeItem('a_and_s_admin_last_activity');
      localStorage.removeItem('a_and_s_admin_last_activity');
      window.location.reload();
    } catch {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0A] text-[#FAF9F5] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-rose-950/30 via-amber-950/20 to-teal-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#A2ADA9] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>العودة للمتجر (Storefront)</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin Exception Guard</span>
        </div>
      </div>

      {/* Main Error Box */}
      <div className="max-w-lg w-full mx-auto my-auto relative z-10 py-8">
        <div className="bg-[#0D1212] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-white">
              تعذر تحميل بعض عناصر لوحة التحكم
            </h1>
            <p className="text-xs text-[#A2ADA9] leading-relaxed">
              حدث استثناء أثناء قراءة بيانات المتجر المخزنة في المتصفح. تم تفعيل الحماية التلقائية لمنع توقف النظام.
            </p>
          </div>

          {/* Error Digest (if present) */}
          {error?.message && (
            <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto">
              <code>{error.message}</code>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:from-[#54d1b2] hover:to-[#00bc7d] text-[#080A0A] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل الصفحة (Try Again)</span>
            </button>

            <button
              onClick={handleClearCacheAndReload}
              className="w-full bg-white/5 hover:bg-white/10 text-[#E6E1D5] hover:text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-amber-400" />
              <span>تحديث بيانات الجلسة وإعادة المحاولة (Reset Session)</span>
            </button>

            <Link
              href="/"
              className="block text-center text-xs text-[#788784] hover:text-[#54d1b2] font-semibold transition-colors pt-2"
            >
              الذهاب إلى المتجر الرئيسي للعملاء →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[#788784] relative z-10 py-2">
        دار رَحِيقْ للعطور الملكية الفاخرة • RAHEEQ Haute Parfumerie
      </div>
    </div>
  );
}
