'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Package,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.orderNumber;

  const whatsappMessage = encodeURIComponent(
    `Hello A AND S Perfumes, I just placed order ${orderNumber}. Please confirm my shipment details.`
  );
  const whatsappUrl = `https://wa.me/201012345678?text=${whatsappMessage}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-10">
      
      {/* Confirmation Badge */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#141A19] border-2 border-[#66D9C5] flex items-center justify-center mx-auto text-[#66D9C5] shadow-2xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="badge-gold px-3 py-1 rounded-sm font-semibold uppercase tracking-widest text-[11px]">
          Order Successfully Received
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F2EB] tracking-tight">
          Thank You For Choosing A AND S
        </h1>

        <div className="inline-block bg-[#111716] border border-[#1A2624] px-6 py-3 rounded-lg mt-2">
          <span className="text-xs text-[#9EABA7] uppercase tracking-wider block">Your Order Reference Number</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#66D9C5] tracking-wider mt-0.5 block">
            {orderNumber}
          </span>
        </div>
      </div>

      {/* Cash on Delivery Notice */}
      <div className="p-6 bg-[#0E1212] border border-[#1A2624] rounded-xl text-left space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1A2624]">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif font-bold text-sm text-[#F5F2EB]">
              Status: Pending Telephone Confirmation
            </h3>
            <p className="text-xs text-[#9EABA7]">
              As per our luxury Cash on Delivery policy, every order is verified before dispatch.
            </p>
          </div>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 bg-[#111716] rounded border border-[#1A2624] space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#66D9C5]/20 text-[#66D9C5] font-bold flex items-center justify-center text-xs">
              1
            </span>
            <p className="font-semibold text-[#F5F2EB]">Concierge Verification</p>
            <p className="text-[#9EABA7] text-[11px]">
              Our team will contact you via phone or WhatsApp to verify your address.
            </p>
          </div>

          <div className="p-3.5 bg-[#111716] rounded border border-[#1A2624] space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#C6A66B]/20 text-[#C6A66B] font-bold flex items-center justify-center text-xs">
              2
            </span>
            <p className="font-semibold text-[#F5F2EB]">Atelier Dispatch</p>
            <p className="text-[#9EABA7] text-[11px]">
              Packed with tamper-evident wax seal and handed to our courier.
            </p>
          </div>

          <div className="p-3.5 bg-[#111716] rounded border border-[#1A2624] space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-[#66D9C5]/20 text-[#66D9C5] font-bold flex items-center justify-center text-xs">
              3
            </span>
            <p className="font-semibold text-[#F5F2EB]">Delivery & Cash Payment</p>
            <p className="text-[#9EABA7] text-[11px]">
              Inspect the package upon doorstep arrival, then pay cash to courier.
            </p>
          </div>
        </div>
      </div>

      {/* Immediate WhatsApp Action */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto btn-primary py-3.5 px-6 rounded-lg text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 shadow-xl"
        >
          <MessageSquare className="w-4 h-4 text-[#080A0A]" />
          <span>Confirm Quickly via WhatsApp</span>
        </a>

        <Link
          href={`/track-order?orderNumber=${orderNumber}`}
          className="w-full sm:w-auto btn-secondary py-3.5 px-6 rounded-lg text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4 text-[#C6A66B]" />
          <span>Track Order Status</span>
        </Link>
      </div>

      <div className="pt-6">
        <Link
          href="/catalog"
          className="text-xs text-[#9EABA7] hover:text-[#66D9C5] transition-colors underline"
        >
          Return to All 120 Fragrances
        </Link>
      </div>
    </div>
  );
}
