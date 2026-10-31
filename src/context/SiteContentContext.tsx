'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_STORAGE_KEY,
  LEGACY_HERO_KEY,
  SiteContentConfig,
} from '@/lib/siteContent';

interface SiteContentContextType {
  siteContent: SiteContentConfig;
  loading: boolean;
  refreshSiteContent: () => Promise<void>;
  updateSiteContent: (newFields: Partial<SiteContentConfig>) => Promise<boolean>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

const TOKEN_KEY = 'a_and_s_admin_jwt_token';

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  // Sync with /api/admin/hero-config which reads from Prisma Postgres
  const refreshSiteContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/hero-config', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSiteContent((prev) => {
            const merged = { ...prev, ...data };
            try {
              localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(merged));
              localStorage.setItem(LEGACY_HERO_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch remote site content config', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Instant local load
    try {
      const cached =
        localStorage.getItem(SITE_CONTENT_STORAGE_KEY) || localStorage.getItem(LEGACY_HERO_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSiteContent((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

    // 2. Fetch latest from Cloud Database (Prisma Postgres) after initial paint
    let timer: NodeJS.Timeout | undefined;
    if (typeof window !== 'undefined') {
      timer = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => refreshSiteContent());
        } else {
          refreshSiteContent();
        }
      }, 3000);
    } else {
      refreshSiteContent();
    }

    // 3. Listen to local storage events across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SITE_CONTENT_STORAGE_KEY || e.key === LEGACY_HERO_KEY) {
        try {
          if (e.newValue) {
            setSiteContent((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
          }
        } catch {}
      }
    };

    const handleCustomUpdate = () => {
      try {
        const cached = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
        if (cached) {
          setSiteContent((prev) => ({ ...prev, ...JSON.parse(cached) }));
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('raheeq_site_content_updated', handleCustomUpdate);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('raheeq_site_content_updated', handleCustomUpdate);
    };
  }, [refreshSiteContent]);

  // Update site content globally across all devices
  const updateSiteContent = async (newFields: Partial<SiteContentConfig>): Promise<boolean> => {
    const updated: SiteContentConfig = {
      ...siteContent,
      ...newFields,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    setSiteContent(updated);
    try {
      localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LEGACY_HERO_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('raheeq_site_content_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Save to Cloud database (Prisma Postgres via /api/admin/hero-config)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/hero-config', {
        method: 'POST',
        headers,
        body: JSON.stringify(updated),
      });

      return res.ok;
    } catch (err) {
      console.warn('Failed saving site content to server:', err);
      return false;
    }
  };

  return (
    <SiteContentContext.Provider
      value={{
        siteContent,
        loading,
        refreshSiteContent,
        updateSiteContent,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
