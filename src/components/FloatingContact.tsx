'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, X, Sparkles, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function FloatingContact() {
  const { t, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = '+201012345678';
  const whatsappUrl = `https://wa.me/201012345678?text=${encodeURIComponent(
    isRtl
      ? 'مرحباً، أود الاستفسار عن عطور A AND S وخدمة التوصيل والدفع عند الاستلام.'
      : 'Hello, I would like to inquire about A AND S fragrances and delivery.'
  )}`;

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 flex flex-col items-end`}>
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div className="mb-3 w-72 bg-[#0E1212] border border-[#66D9C5]/40 rounded-xl p-4 shadow-2xl text-[#F5F2EB] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex justify-between items-start pb-2 border-b border-[#1A2624]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-serif font-bold text-[#F5F2EB]">
                {isRtl ? 'خدمة عملاء A AND S' : 'A AND S Concierge'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#9EABA7] hover:text-[#F5F2EB] p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[#9EABA7] my-2 leading-relaxed">
            {isRtl
              ? 'تواصل مباشرة مع معملنا في القاهرة للاستفسارات وطلبات التوصيل السريع والدفع عند الاستلام.'
              : 'Direct communication with our Cairo atelier for orders, recommendations, and delivery.'}
          </p>

          <div className="space-y-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isRtl ? 'محادثة عبر واتساب' : 'Chat on WhatsApp'}</span>
            </a>

            <a
              href={`tel:${phoneNumber}`}
              className="w-full py-2.5 px-3 bg-[#141A19] hover:bg-[#1C2624] text-[#66D9C5] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#1A2624]"
            >
              <Phone className="w-4 h-4" />
              <span>010 1234 5678</span>
            </a>
          </div>

          <div className="mt-3 pt-2 border-t border-[#1A2624] text-[10px] text-center text-[#6C7A77]">
            {isRtl ? 'متاحون يومياً • توصيل لجميع المحافظات' : 'Available daily • Delivery across all Egypt'}
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-[#0B665D] hover:bg-[#0E7A70] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl border border-[#66D9C5]/50 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Direct Contact WhatsApp & Phone"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#080A0A] animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#080A0A]" />
        
        <MessageSquare className="w-5 h-5 text-[#66D9C5]" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          {isRtl ? 'تواصل معنا' : 'Contact Us'}
        </span>
      </button>
    </div>
  );
}
