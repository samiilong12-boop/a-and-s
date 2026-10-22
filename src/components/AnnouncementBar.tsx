import React from 'react';
import { Truck, Sparkles } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="bg-[#0B665D] text-[#F5F2EB] text-xs py-2 px-4 border-b border-[#14423C]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#66D9C5]" />
          <span>COMPLIMENTARY LUXURY DELIVERY ACROSS EGYPT ON ORDERS OVER 1,000 EGP</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px] text-[#A2C7C1]">
          <span className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-[#66D9C5]" />
            Cash on Delivery Available
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline text-[#F5F2EB] font-medium">Cairo, Egypt</span>
        </div>
      </div>
    </div>
  );
}
