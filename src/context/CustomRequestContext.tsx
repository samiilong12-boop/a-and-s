'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BespokePerfumeRequest } from '@/types';

interface CustomRequestContextType {
  isModalOpen: boolean;
  openModal: (defaultPerfumeName?: string) => void;
  closeModal: () => void;
  defaultPerfume: string;
  requests: BespokePerfumeRequest[];
  submitRequest: (data: {
    customerName: string;
    customerPhone: string;
    perfumeName: string;
    volumeMl: string;
    concentration: string;
    notes?: string;
  }) => Promise<{ success: boolean; request?: BespokePerfumeRequest }>;
  updateRequestStatus: (id: string, status: BespokePerfumeRequest['status']) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
}

const CustomRequestContext = createContext<CustomRequestContextType | undefined>(undefined);

export const CUSTOM_REQUESTS_STORAGE_KEY = 'raheeq_custom_requests_cache_v2';
const LEGACY_STORAGE_KEY = 'a_and_s_custom_requests_cache';

export function CustomRequestProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultPerfume, setDefaultPerfume] = useState('');
  const [requests, setRequests] = useState<BespokePerfumeRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const openModal = (perfumeName = '') => {
    setDefaultPerfume(perfumeName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDefaultPerfume('');
  };

  // Helper to read local storage safely
  const getLocalStoredRequests = useCallback((): BespokePerfumeRequest[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored =
        localStorage.getItem(CUSTOM_REQUESTS_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading local bespoke requests', e);
    }
    return [];
  }, []);

  // Intelligently merge without losing any requests
  const refreshRequests = useCallback(async () => {
    const local = getLocalStoredRequests();

    try {
      const res = await fetch('/api/custom-requests');
      if (res.ok) {
        const remote: BespokePerfumeRequest[] = await res.json();

        // Merge both by ID: remote items + local items
        const map = new Map<string, BespokePerfumeRequest>();
        remote.forEach((r) => map.set(r.id, r));
        local.forEach((r) => map.set(r.id, r)); // local submissions take priority/preserved

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setRequests(merged);
        localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(merged));
        return;
      }
    } catch (e) {
      console.warn('Remote sync error, using local requests', e);
    }

    if (local.length > 0) {
      setRequests(local);
    }
  }, [getLocalStoredRequests]);

  // Initial mount: load local immediately, then fetch remote
  useEffect(() => {
    const local = getLocalStoredRequests();
    if (local.length > 0) {
      setRequests(local);
    }
    setIsHydrated(true);
    refreshRequests();

    // Listen for storage changes across tabs or custom dispatch
    const handleStorageEvent = () => {
      refreshRequests();
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('raheeq_custom_requests_updated', handleStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('raheeq_custom_requests_updated', handleStorageEvent);
    };
  }, [getLocalStoredRequests, refreshRequests]);

  const submitRequest = async (data: {
    customerName: string;
    customerPhone: string;
    perfumeName: string;
    volumeMl: string;
    concentration: string;
    notes?: string;
  }) => {
    const newReq: BespokePerfumeRequest = {
      id: `req-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: data.customerName || 'عميل رحيق',
      customerPhone: data.customerPhone,
      perfumeName: data.perfumeName,
      volumeMl: data.volumeMl,
      concentration: data.concentration,
      notes: data.notes || '',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    // 1. Instant optimistic local update
    const current = getLocalStoredRequests();
    const updated = [newReq, ...current.filter((r) => r.id !== newReq.id)];

    setRequests(updated);
    try {
      localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
      // Notify other tabs/admin windows immediately
      window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }

    // 2. Persist to API in background
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.request) {
          return { success: true, request: result.request };
        }
      }
    } catch (e) {
      console.warn('API post failed, kept safe in local cache', e);
    }

    return { success: true, request: newReq };
  };

  const updateRequestStatus = async (id: string, status: BespokePerfumeRequest['status']) => {
    const current = getLocalStoredRequests();
    const updated = current.map((r) => (r.id === id ? { ...r, status } : r));

    setRequests(updated);
    try {
      localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
    } catch {}

    try {
      await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error('Failed to patch request', e);
    }
  };

  const deleteRequest = async (id: string) => {
    const current = getLocalStoredRequests();
    const updated = current.filter((r) => r.id !== id);

    setRequests(updated);
    try {
      localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
    } catch {}

    try {
      await fetch(`/api/custom-requests?id=${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete request', e);
    }
  };

  return (
    <CustomRequestContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        defaultPerfume,
        requests,
        submitRequest,
        updateRequestStatus,
        deleteRequest,
        refreshRequests,
      }}
    >
      {children}
    </CustomRequestContext.Provider>
  );
}

export function useCustomRequest() {
  const context = useContext(CustomRequestContext);
  if (!context) {
    throw new Error('useCustomRequest must be used within a CustomRequestProvider');
  }
  return context;
}
