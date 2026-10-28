import { OrderStatus, PaymentStatus } from '@/types';

/**
 * Permitted Order Status Transitions (E2)
 */
export const PERMITTED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: [], // Terminal fulfillment state
  CANCELLED: [], // Terminal cancellation state
  RETURNED: [],  // Terminal return state
};

/**
 * Permitted Payment / COD Settlement Transitions (E10)
 */
export const PERMITTED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING_COLLECTION: ['COLLECTED_BY_COURIER', 'FAILED_COLLECTION'],
  COLLECTED_BY_COURIER: ['REMITTED_TO_STORE'],
  REMITTED_TO_STORE: ['REFUNDED'],
  FAILED_COLLECTION: [],
  REFUNDED: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return PERMITTED_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus): boolean {
  return PERMITTED_PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getOrderStatusLabel(status: OrderStatus): { labelEn: string; labelAr: string; colorClass: string } {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return { labelEn: 'Pending Confirmation', labelAr: 'قيد التأكيد', colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
    case 'CONFIRMED':
      return { labelEn: 'Confirmed', labelAr: 'تم التأكيد', colorClass: 'text-teal-400 bg-teal-400/10 border-teal-400/30' };
    case 'PROCESSING':
      return { labelEn: 'Processing & Packing', labelAr: 'جاري التجهيز', colorClass: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
    case 'OUT_FOR_DELIVERY':
      return { labelEn: 'Out for Delivery', labelAr: 'مع المندوب للتوصيل', colorClass: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    case 'DELIVERED':
      return { labelEn: 'Delivered', labelAr: 'تم التسليم', colorClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    case 'CANCELLED':
      return { labelEn: 'Cancelled', labelAr: 'ملغي', colorClass: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
    case 'RETURNED':
      return { labelEn: 'Returned / Rejected', labelAr: 'مرتجع', colorClass: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
  }
}

export function getPaymentStatusLabel(status: PaymentStatus): { labelEn: string; labelAr: string; colorClass: string } {
  switch (status) {
    case 'PENDING_COLLECTION':
      return { labelEn: 'Cash Pending Collection', labelAr: 'الدفع عند الاستلام (قيد التحصيل)', colorClass: 'text-amber-400 bg-amber-400/10' };
    case 'COLLECTED_BY_COURIER':
      return { labelEn: 'Collected by Courier', labelAr: 'تم التحصيل من المندوب', colorClass: 'text-cyan-400 bg-cyan-400/10' };
    case 'REMITTED_TO_STORE':
      return { labelEn: 'Remitted to Store Bank', labelAr: 'تم التوريد لحساب المتجر', colorClass: 'text-emerald-400 bg-emerald-400/10' };
    case 'FAILED_COLLECTION':
      return { labelEn: 'Failed Collection', labelAr: 'فشل التحصيل', colorClass: 'text-rose-400 bg-rose-400/10' };
    case 'REFUNDED':
      return { labelEn: 'Refunded', labelAr: 'مسترد للعميل', colorClass: 'text-purple-400 bg-purple-400/10' };
  }
}
