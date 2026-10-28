'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Printer,
  ShieldCheck,
  RefreshCw,
  Crown,
  Eye,
} from 'lucide-react';

export default function AdminQrCodePage() {
  const [url, setUrl] = useState('https://a-and-s.vercel.app/');
  const [darkQrDataUrl, setDarkQrDataUrl] = useState<string>('');
  const [lightQrDataUrl, setLightQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateLuxuryQRCodes(url);
  }, [url]);

  const generateLuxuryQRCodes = async (targetUrl: string) => {
    setIsGenerating(true);
    try {
      // 1. Generate Clean Light QR Code (for printing on white cards / box labels)
      const lightUrl = await QRCode.toDataURL(targetUrl, {
        width: 1200,
        margin: 2,
        color: {
          dark: '#080A0A',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      setLightQrDataUrl(lightUrl);

      // 2. Generate Luxury Dark QR Code (for dark obsidian packaging & web modal)
      const darkUrl = await QRCode.toDataURL(targetUrl, {
        width: 1200,
        margin: 2,
        color: {
          dark: '#D4AF37', // Gold QR modules
          light: '#080A0A', // Dark obsidian background
        },
        errorCorrectionLevel: 'H',
      });
      setDarkQrDataUrl(darkUrl);
    } catch (err) {
      console.error('QR code generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQrCode = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-teal-800 uppercase">
              هوية العلامة والتغليف (Packaging & Branding)
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
              كود QR فائق الدقة (300 DPI)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-teal-700" />
            <span>كود QR الرسمي لمتجر دار رحيق (Raheeq)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            كود QR مخصص بدقة عالية جداً وجاهز للطباعة على علب العطور، كروت الشكر، شنط التوصيل، والملصقات مع رابط
            المتجر المباشر.
          </p>
        </div>

        <Link
          href={url}
          target="_blank"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs self-start md:self-auto"
        >
          <span>زيارة الرابط المباشر</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Target URL Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>الرابط الموجه إليه الكود (Target Storefront URL):</span>
          {copied && (
            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تم نسخ الرابط للحافظة!</span>
            </span>
          )}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
          />
          <button
            onClick={handleCopy}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>نسخ الرابط</span>
          </button>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Dark Luxury Edition (Black & Gold) */}
        <div className="bg-[#080A0A] text-white rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle gold glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-widest uppercase font-bold">
              <Crown className="w-3 h-3 text-[#D4AF37]" />
              <span>الإصدار الملكي الفاخر (Gold & Obsidian)</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              كود رحيق الأسود والذهبي
            </h3>
            <p className="text-xs text-slate-400">
              مثالي للطباعة على علب العطور الفاخرة الداكنة والمواقع وشاشات العرض.
            </p>
          </div>

          {/* QR Display Card */}
          <div className="bg-[#0D1212] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-2xl flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto w-full relative z-10">
            {darkQrDataUrl ? (
              <div className="relative w-56 h-56 rounded-xl overflow-hidden p-2 bg-[#080A0A] border border-[#D4AF37]/40 flex items-center justify-center">
                <img
                  src={darkQrDataUrl}
                  alt="Raheeq Dark Luxury QR"
                  className="w-full h-full object-contain rounded-lg"
                />
                {/* Center Raheeq Emblem Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-[#080A0A] border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center justify-center overflow-hidden">
                    <img
                      src="/images/raheeq-official-logo.png"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
              </div>
            )}

            <div className="text-center space-y-0.5">
              <span className="font-serif font-bold text-sm tracking-widest text-[#D4AF37]">
                رَحِيقْ | RAHEEQ
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider">HAUTE PARFUMERIE</p>
            </div>
          </div>

          {/* Download Action */}
          <div className="relative z-10 pt-2">
            <button
              onClick={() => downloadQrCode(darkQrDataUrl, 'raheeq-qr-gold-luxury.png')}
              disabled={!darkQrDataUrl}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-[#080A0A] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الكود الذهبي الفاخر (PNG عالي الدقة)</span>
            </button>
          </div>
        </div>

        {/* 2. Clean Light Edition (Black & White for Commercial Print) */}
        <div className="bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] tracking-widest uppercase font-bold">
              <Printer className="w-3 h-3 text-slate-700" />
              <span>إصدار الطباعة التجارية (Print-Ready)</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
              كود رحيق الواضح للمطابع
            </h3>
            <p className="text-xs text-slate-500">
              مخصص للطباعة على كروت الشكر الورقية، ملصقات الباركود، والفواتير الورقية بأعلى وضوح لقارئات الهواتف.
            </p>
          </div>

          {/* QR Display Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center space-y-4 max-w-xs mx-auto w-full">
            {lightQrDataUrl ? (
              <div className="relative w-56 h-56 rounded-xl overflow-hidden p-2 bg-white border border-slate-300 flex items-center justify-center shadow-xs">
                <img
                  src={lightQrDataUrl}
                  alt="Raheeq Print Ready QR"
                  className="w-full h-full object-contain rounded-lg"
                />
                {/* Center Raheeq Emblem Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-900 shadow-md flex items-center justify-center overflow-hidden">
                    <img
                      src="/images/raheeq-official-logo.png"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-700" />
              </div>
            )}

            <div className="text-center space-y-0.5">
              <span className="font-serif font-bold text-sm tracking-widest text-slate-900">
                رَحِيقْ | RAHEEQ
              </span>
              <p className="text-[10px] text-slate-500 tracking-wider">HAUTE PARFUMERIE</p>
            </div>
          </div>

          {/* Download Action */}
          <div className="pt-2">
            <button
              onClick={() => downloadQrCode(lightQrDataUrl, 'raheeq-qr-print-ready.png')}
              disabled={!lightQrDataUrl}
              className="w-full bg-slate-900 hover:bg-teal-700 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل كود الطباعة (PNG عالي الدقة للمطابع)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Packaging & Card Guide */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-700" />
          <span>إرشادات طباعة كود QR على المنتجات والكروت:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <strong className="block text-slate-900 font-bold">1. كروت الشكر داخل الصندوق</strong>
            <p>اطبع الكود بمقاس 2.5 × 2.5 سم على كرت أنيق مرفق مع الطلب لتسهيل إعادة الطلب بمسحة واحدة.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <strong className="block text-slate-900 font-bold">2. خلفية علبة العطر الخارجية</strong>
            <p>ضعه في زاوية العلبة السفلية بجوار الباركود ليعطي الزبائن انطباعاً تقنياً واحترافياً راقياً.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <strong className="block text-slate-900 font-bold">3. أكياس المتجر والملصقات</strong>
            <p>اطبعه على الأكياس الفاخرة للترويج الفيروسي حينما يحمل العميل الكيس في الشارع أو التجمعات.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
