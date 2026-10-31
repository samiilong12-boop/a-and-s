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
  updateRequestStatus: (id: string, status: BespokePerfumeRequest['status']) => Promise<{ success: boolean; error?: string }>;
  deleteRequest: (id: string) => Promise<{ success: boolean; error?: string }>;
  clearFulfilledRequests: () => Promise<{ success: boolean; error?: string }>;
  markAllActiveAsFulfilled: () => Promise<{ success: boolean; error?: string }>;
  refreshRequests: () => Promise<void>;
}

const CustomRequestContext = createContext<CustomRequestContextType | undefined>(undefined);

export const CUSTOM_REQUESTS_STORAGE_KEY = 'raheeq_custom_requests_cache_v3';
export const LEGACY_STORAGE_KEY = 'a_and_s_custom_requests_cache';
export const TOKEN_KEY = 'a_and_s_admin_jwt_token';

function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

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

  const getLocalStoredRequests = useCallback((): BespokePerfumeRequest[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored =
        localStorage.getItem(CUSTOM_REQUESTS_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((r) => r && !r.deletedAt);
        }
      }
    } catch (e) {
      console.warn('Failed reading local bespoke requests', e);
    }
    return [];
  }, []);

  // Server-Authoritative Refresh: Remote is the single source of truth
  const refreshRequests = useCallback(async () => {
    const isAdmin =
      typeof window !== 'undefined' &&
      (Boolean(sessionStorage.getItem(TOKEN_KEY)) ||
        Boolean(localStorage.getItem(TOKEN_KEY)) ||
        window.location.pathname.startsWith('/admin'));

    if (!isAdmin) {
      const local = getLocalStoredRequests();
      if (local.length > 0) setRequests(local);
      return;
    }

    try {
      const res = await fetch('/api/custom-requests', {
        headers: getAdminAuthHeaders(),
        cache: 'no-store',
      });
      if (res.ok) {
        const remote: BespokePerfumeRequest[] = await res.json();
        if (Array.isArray(remote)) {
          const validRemote = remote.filter((r) => r && !r.deletedAt);
          setRequests(validRemote);
          try {
            localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(validRemote));
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(validRemote));
          } catch {}
          return;
        }
      }
    } catch (e) {
      console.warn('Remote sync error, using local requests', e);
    }

    const local = getLocalStoredRequests();
    if (local.length > 0) {
      setRequests(local);
    }
  }, [getLocalStoredRequests]);

  useEffect(() => {
    const local = getLocalStoredRequests();
    if (local.length > 0) {
      setRequests(local);
    }
    setIsHydrated(true);
    refreshRequests();

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
    const id = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const newReq: BespokePerfumeRequest = {
      id,
      customerName: data.customerName || 'عميل رحيق',
      customerPhone: data.customerPhone,
      perfumeName: data.perfumeName,
      volumeMl: data.volumeMl,
      concentration: data.concentration,
      notes: data.notes || '',
      status: 'NEW',
      isArchived: false,
      archivedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      });
      if (res.ok) {
        const result = await res.json();
        const savedReq = result.request || newReq;
        setRequests((prev) => [savedReq, ...prev.filter((r) => r.id !== savedReq.id)]);
        try {
          const updatedLocal = [savedReq, ...getLocalStoredRequests().filter((r) => r.id !== savedReq.id)];
          localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updatedLocal));
          window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
        } catch {}
        return { success: true, request: savedReq };
      }
    } catch (e) {
      console.warn('API post failed, keeping locally', e);
    }

    setRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);
    return { success: true, request: newReq };
  };

  const updateRequestStatus = async (
    id: string,
    status: BespokePerfumeRequest['status']
  ): Promise<{ success: boolean; error?: string }> => {
    const isArchived = status === 'FULFILLED' || status === 'COMPLETED';
    const archivedAt = isArchived ? new Date().toISOString() : null;

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ id, status, isArchived, archivedAt }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || `خطأ ${res.status}` };
      }

      const json = await res.json();
      const confirmedReq: BespokePerfumeRequest = json.request || {
        ...requests.find((r) => r.id === id),
        id,
        status,
        isArchived,
        archivedAt,
      };

      setRequests((prev) => prev.map((r) => (r.id === id ? confirmedReq : r)));
      try {
        const updatedLocal = getLocalStoredRequests().map((r) =>
          r.id === id ? confirmedReq : r
        );
        localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updatedLocal));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
      } catch {}

      return { success: true };
    } catch (err: any) {
      console.error('Network error patching request status:', err);
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  };

  const deleteRequest = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/custom-requests?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || `خطأ ${res.status}` };
      }

      setRequests((prev) => prev.filter((r) => r.id !== id));
      try {
        const updatedLocal = getLocalStoredRequests().filter((r) => r.id !== id);
        localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updatedLocal));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
      } catch {}

      return { success: true };
    } catch (err: any) {
      console.error('Network error deleting request:', err);
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  };

  const clearFulfilledRequests = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/custom-requests?clearFulfilled=true', {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || `خطأ ${res.status}` };
      }

      setRequests((prev) => prev.filter((r) => r.status !== 'FULFILLED' && r.status !== 'COMPLETED' && !r.isArchived));
      try {
        const updatedLocal = getLocalStoredRequests().filter(
          (r) => r.status !== 'FULFILLED' && r.status !== 'COMPLETED' && !r.isArchived
        );
        localStorage.setItem(CUSTOM_REQUESTS_STORAGE_KEY, JSON.stringify(updatedLocal));
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event('raheeq_custom_requests_updated'));
      } catch {}

      return { success: true };
    } catch (err: any) {
      console.error('Network error clearing fulfilled requests:', err);
      return { success: false, error: err.message || 'خطأ في الاتصال بالخادم' };
    }
  };

  const markAllActiveAsFulfilled = async (): Promise<{ success: boolean; error?: string }> => {
    const activeItems = requests.filter((r) => r.status === 'NEW' || r.status === 'CONTACTED');
    if (activeItems.length === 0) return { success: true };

    for (const req of activeItems) {
      await updateRequestStatus(req.id, 'FULFILLED');
    }
    return { success: true };
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
        clearFulfilledRequests,
        markAllActiveAsFulfilled,
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
