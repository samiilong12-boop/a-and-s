'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackAnalyticsEvent } from '@/lib/analyticsTracker';

export function ClientAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Track anonymous page view
    trackAnalyticsEvent('page_view', 'pageview', {
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
    });

    // 2. Click tracking on prominent CTAs
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const closestButton = target.closest('button, a');
      if (!closestButton) return;

      const text = closestButton.textContent?.trim() || '';
      
      if (text.includes('اطلب الآن') || text.includes('حدد الحجم')) {
        trackAnalyticsEvent('click_bespoke_request', 'click', { label: text });
      } else if (text.includes('إضافة إلى الحقيبة') || text.includes('Add To Bag')) {
        trackAnalyticsEvent('click_add_to_cart', 'funnel', { label: text });
      } else if (text.includes('طلب فوري') || text.includes('الدفع عند الاستلام') || text.includes('Instant Cash')) {
        trackAnalyticsEvent('click_instant_buy', 'funnel', { label: text });
      } else if (text.includes('واتساب') || text.includes('WhatsApp')) {
        trackAnalyticsEvent('click_whatsapp_concierge', 'click', { label: text });
      }
    };

    window.addEventListener('click', handleClick, { passive: true });
    return () => window.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
