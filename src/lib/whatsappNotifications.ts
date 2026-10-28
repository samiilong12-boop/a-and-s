/**
 * WhatsApp Notification & Concierge Automation for RAHEEQ (A AND S)
 * Generates official luxury pre-filled messages and direct wa.me links
 */

export const OFFICIAL_WHATSAPP_LINE_1 = '201131068790';
export const OFFICIAL_WHATSAPP_LINE_2 = '201011800245';

const SITE_URL = 'https://a-and-s.vercel.app';

/**
 * Format Egyptian phone number to international wa.me format (e.g. 201XXXXXXXXX)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('01') && digits.length === 11) {
    return `20${digits.substring(1)}`;
  }
  if (digits.startsWith('201') && digits.length === 12) {
    return digits;
  }
  return digits || OFFICIAL_WHATSAPP_LINE_1;
}

/**
 * 1. Order Confirmation Receipt (Sent to Customer)
 */
export function generateOrderConfirmationWhatsapp(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalInPiasters: number;
  items: Array<{ productNameAr?: string; productNameEn?: string; quantity: number; volumeMl?: number }>;
  shippingAddress: { city: string; streetAddress: string };
}): string {
  const totalEgp = Math.round(order.totalInPiasters / 100).toLocaleString('ar-EG');
  const itemsText = order.items
    .map((item) => `  • ${item.productNameAr || item.productNameEn || 'عطر فاخر'} (${item.volumeMl || 100} مل) × ${item.quantity}`)
    .join('\n');

  const trackingUrl = `${SITE_URL}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone.slice(-8))}`;

  const message =
    `💎 *دار رَحِـيـقْ للعطور الملكية الفاخرة | RAHEEQ Haute Parfumerie*\n\n` +
    `مرحباً بك *${order.customerName}*،\n` +
    `تم تسجيل طلبك الملكي بنجاح وهو الآن قيد التجهيز والتغليف الفاخر ⚜️\n\n` +
    `📋 *تفاصيل الطلب:*\n` +
    `• *رقم المرجع:* \`${order.orderNumber}\`\n` +
    `• *المنتجات:*\n${itemsText}\n` +
    `• *إجمالي المبلغ:* ${totalEgp} ج.م (الدفع عند الاستلام بعد المعاينة)\n` +
    `• *عنوان الشحن:* ${order.shippingAddress.city}، ${order.shippingAddress.streetAddress}\n\n` +
    `🔍 *تتبع شحنتك مباشرة:* \n${trackingUrl}\n\n` +
    `✨ *ملاحظة:* لك كامل الحق في فتح كرتونة الشحن ومعاينة الزجاجة والتغليف قبل سداد المبلغ للمندوب.\n` +
    `شكراً لثقتكم بذوق دار رحيق الرفيع.`;

  const targetPhone = formatPhoneForWhatsApp(order.customerPhone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * 2. Dispatch / Out For Delivery Alert (With Courier Details)
 */
export function generateDispatchAlertWhatsapp(
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
  },
  courierName?: string,
  trackingNumber?: string
): string {
  const trackingUrl = `${SITE_URL}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone.slice(-8))}`;

  const message =
    `🚚 *تحديث الشحنة — دار رَحِـيـقْ (RAHEEQ)* 💎\n\n` +
    `مرحباً بك *${order.customerName}*،\n` +
    `يسرنا إبلاغك بأن طلبك رقم \`${order.orderNumber}\` خرج الآن مع المندوب وهو في الطريق إلى عنوانك ⚜️\n\n` +
    (courierName ? `• *شركة الشحن / المندوب:* ${courierName}\n` : '') +
    (trackingNumber ? `• *بوليصة التتبع:* \`${trackingNumber}\`\n` : '') +
    `• *رابط المتابعة المباشر:* \n${trackingUrl}\n\n` +
    `📦 يرجى العلم بأن الشحنة مشمولة بسياسة **المعاينة عند الاستلام** للتأكد من سلامة الزجاجة والتغليف الملكي قبل السداد.\n\n` +
    `خدمة عملاء رحيق: ${OFFICIAL_WHATSAPP_LINE_1}`;

  const targetPhone = formatPhoneForWhatsApp(order.customerPhone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * 3. Fulfilled / Delivery Complete Gratitude & Care Tips
 */
export function generateFulfilledReceiptWhatsapp(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
}): string {
  const message =
    `👑 *تهانينا لاقتنائكم عطر رَحِـيـقْ | RAHEEQ Haute Parfumerie*\n\n` +
    `عزيزنا *${order.customerName}*،\n` +
    `نأمل أن تكون تجربة استلام العطر قد نالت كامل إعجابكم ورضاكم 💎\n\n` +
    `🌟 *نصائح الخبراء للحصول على أقصى ثبات وفوحان (تركيز 25% معتق):*\n` +
    `1. يُفضل رش العطر على أماكن النبض (معصمي اليدين، جانبي الرقبة، وخلف الأذنين).\n` +
    `2. حفظ الزجاجة في مكان بارد ومعتم بعيداً عن أشعة الشمس المباشرة للحفاظ على ثبات الزيوت النقية.\n\n` +
    `يسعدنا دائماً استقبال آرائكم وترشيحاتكم لخلطاتكم القادمة عبر هذا الرقم.\n` +
    `طاب يومكم بكل عبقٍ فاخر.`;

  const targetPhone = formatPhoneForWhatsApp(order.customerPhone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * 4. Bespoke Perfume Status Update Notification
 */
export function generateBespokeStatusWhatsapp(
  req: {
    id: string;
    customerName: string;
    customerPhone: string;
    perfumeName: string;
    volumeMl: string;
  },
  newStatus: 'NEW' | 'CONTACTED' | 'FULFILLED' | 'CANCELLED' | string
): string {
  const trackingUrl = `${SITE_URL}/track-order?orderNumber=${encodeURIComponent(req.id)}&phone=${encodeURIComponent(req.customerPhone.slice(-8))}`;

  let statusText = 'تم استلام طلب الخلطة بنجاح وبدء المراجعة';
  if (newStatus === 'CONTACTED') {
    statusText = 'جاري تحضير وتعتيق الزيوت العطرية الخاصة بالخلطة في المعمل';
  } else if (newStatus === 'FULFILLED') {
    statusText = 'تم اكتمال تعتيق وتركيب عطرك الخاص وتجهيزه للتسليم الفاخر';
  } else if (newStatus === 'CANCELLED') {
    statusText = 'تم إلغاء الطلب بناءً على رغبتكم';
  }

  const message =
    `🧪 *تحديث طلب العطر الخاص — دار رَحِـيـقْ (RAHEEQ Bespoke Atelier)* 💎\n\n` +
    `مرحباً بك *${req.customerName}*،\n` +
    `نود إحاطتكم بآخر تحديث لطلب تركيبتكم العطرية الخاصة:\n\n` +
    `• *رقم الطلب:* \`${req.id}\`\n` +
    `• *العطر المطلوب:* ${req.perfumeName} (${req.volumeMl})\n` +
    `• *الحالة الحالية:* ${statusText}\n\n` +
    `🔍 *متابعة تفاصيل التجهيز مباشرة:* \n${trackingUrl}\n\n` +
    `لأي استفسار أو تعديل على مكونات الخلطة، نحن دائماً في خدمتكم.`;

  const targetPhone = formatPhoneForWhatsApp(req.customerPhone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
