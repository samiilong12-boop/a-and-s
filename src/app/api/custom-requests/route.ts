import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { BespokePerfumeRequest } from '@/types';

// Declare global in-memory container to survive within Node.js runtime
declare global {
  var __BESPOKE_REQUESTS__: BespokePerfumeRequest[] | undefined;
}

const tmpFilePath = path.join(os.tmpdir(), 'raheeq-custom-requests.json');
const publicFilePath = path.join(process.cwd(), 'public', 'data', 'custom-requests.json');

const INITIAL_REQUESTS: BespokePerfumeRequest[] = [
  {
    id: 'req-init-1',
    customerName: 'طارق عبد المنعم',
    customerPhone: '+201012345678',
    perfumeName: 'Tom Ford Tobacco Vanille + Oud Wood (خلطة مخصصة)',
    volumeMl: '100ml',
    concentration: 'EXTRAIT_DE_PARFUM',
    notes: 'أريد تركيز عالي وثبات ممتاز يدوم لأكثر من 24 ساعة للمناسبات الرسمية',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'req-init-2',
    customerName: 'مريم الجندي',
    customerPhone: '+201123456789',
    perfumeName: 'Delina Exclusif de Marly (تركيز خاص)',
    volumeMl: '50ml',
    concentration: 'EAU_DE_PARFUM',
    notes: 'يفضل إضافة لمسة إضافية خفيفة من المسك الأبيض',
    status: 'NEW',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function loadPersistedRequests(): BespokePerfumeRequest[] {
  // 1. Check global memory
  if (globalThis.__BESPOKE_REQUESTS__ && Array.isArray(globalThis.__BESPOKE_REQUESTS__)) {
    return globalThis.__BESPOKE_REQUESTS__;
  }

  // 2. Check /tmp on serverless
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__BESPOKE_REQUESTS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // continue
  }

  // 3. Check public/data/custom-requests.json
  try {
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__BESPOKE_REQUESTS__ = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // continue
  }

  // 4. Default seed
  globalThis.__BESPOKE_REQUESTS__ = INITIAL_REQUESTS;
  return INITIAL_REQUESTS;
}

function persistRequests(list: BespokePerfumeRequest[]) {
  // 1. Global in-memory
  globalThis.__BESPOKE_REQUESTS__ = list;

  // 2. Write to /tmp (always writable in AWS Lambda / Vercel serverless)
  try {
    fs.writeFileSync(tmpFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing to tmp:', e);
  }

  // 3. Attempt local public file (works in local dev)
  try {
    const dir = path.dirname(publicFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(publicFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    // Expected on read-only serverless
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const requests = loadPersistedRequests();
  return NextResponse.json(requests, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = loadPersistedRequests();

    const newRequest: BespokePerfumeRequest = {
      id: body.id || `req-${Date.now()}`,
      customerName: body.customerName || 'عميل رحيق',
      customerPhone: body.customerPhone || '',
      perfumeName: body.perfumeName || '',
      volumeMl: body.volumeMl || '100ml',
      concentration: body.concentration || 'EXTRAIT_DE_PARFUM',
      notes: body.notes || '',
      status: 'NEW',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // Prevent duplicate IDs
    const updated = [newRequest, ...existing.filter((r) => r.id !== newRequest.id)];
    persistRequests(updated);

    return NextResponse.json({ success: true, request: newRequest, all: updated });
  } catch (error) {
    console.error('Failed to create custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const existing = loadPersistedRequests();

    const updated = existing.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    persistRequests(updated);

    return NextResponse.json({ success: true, requests: updated });
  } catch (error) {
    console.error('Failed to update custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearFulfilled = searchParams.get('clearFulfilled');
    const existing = loadPersistedRequests();

    if (clearFulfilled === 'true') {
      const updated = existing.filter((r) => r.status !== 'FULFILLED');
      persistRequests(updated);
      return NextResponse.json({ success: true, requests: updated, deletedCount: existing.length - updated.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id or clearFulfilled' }, { status: 400 });
    }

    const updated = existing.filter((r) => r.id !== id);
    persistRequests(updated);

    return NextResponse.json({ success: true, requests: updated });
  } catch (error) {
    console.error('Failed to delete custom request:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
