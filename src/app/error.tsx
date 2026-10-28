'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Raheeq Global App Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080A0A] text-[#FAF9F5] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#00bc7d]/15 via-[#54d1b2]/10 to-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="flex justify-between items-center max-w-4xl mx-auto w-full relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#A2ADA9] hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>الرئيسية (Home)</span>
        </Link>
        <span className="text-[11px] text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full font-mono">
          RAHEEQ Safety Boundary
        </span>
      </div>

      <div className="max-w-md w-full mx-auto my-auto relative z-10 py-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 mx-auto flex items-center justify-center text-[#54d1b2]">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-white">
            نعتذر، حدث خطأ بسيط أثناء التحميل
          </h1>
          <p className="text-xs text-[#A2ADA9] leading-relaxed">
            تم تسجيل الخطأ تلقائياً. يمكنك الضغط على الزر أدناه لإعادة تحميل الصفحة واستئناف تصفح عطور دار رحيق.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full bg-gradient-to-r from-[#00bc7d] to-[#54d1b2] hover:from-[#54d1b2] hover:to-[#00bc7d] text-[#080A0A] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة تحميل الصفحة (Reload)</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-[#E6E1D5] hover:text-white font-bold py-3 px-6 rounded-xl text-xs border border-white/15 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>العودة لكتالوج العطور</span>
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#788784] relative z-10 py-2">
        دار رَحِيقْ للعطور الملكية الفاخرة • RAHEEQ Haute Parfumerie
      </div>
    </div>
  );
}
