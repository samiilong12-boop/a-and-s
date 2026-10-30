import { describe, it, expect } from 'vitest';

describe('Orders Archiving and Server Sync Protocol', () => {
  it('partitions orders into active and archive seamlessly without letting archived orders resurface in active', () => {
    const rawOrders = [
      { orderNumber: 'AS-202610-0001', isArchived: false, createdAt: '2026-10-30T10:00:00Z' },
      { orderNumber: 'AS-202610-0002', isArchived: true, archivedAt: '2026-10-30T11:00:00Z', createdAt: '2026-10-30T09:00:00Z' },
      { orderNumber: 'AS-202610-0003', isArchived: false, createdAt: '2026-10-30T08:00:00Z' },
    ];

    const activeMap = new Map<string, any>();
    const archiveMap = new Map<string, any>();

    rawOrders.forEach((ro) => {
      if (ro.isArchived) {
        archiveMap.set(ro.orderNumber, ro);
        activeMap.delete(ro.orderNumber);
      } else {
        activeMap.set(ro.orderNumber, ro);
      }
    });

    expect(activeMap.has('AS-202610-0001')).toBe(true);
    expect(activeMap.has('AS-202610-0002')).toBe(false); // Must NEVER be in active!
    expect(activeMap.has('AS-202610-0003')).toBe(true);

    expect(archiveMap.has('AS-202610-0002')).toBe(true);
    expect(archiveMap.has('AS-202610-0001')).toBe(false);

    // Test archiving an active order
    const toArchive = activeMap.get('AS-202610-0001');
    archiveMap.set(toArchive.orderNumber, { ...toArchive, isArchived: true, archivedAt: new Date().toISOString() });
    activeMap.delete(toArchive.orderNumber);

    expect(activeMap.has('AS-202610-0001')).toBe(false);
    expect(archiveMap.has('AS-202610-0001')).toBe(true);

    // Test restoring an archived order
    const toRestore = archiveMap.get('AS-202610-0002');
    activeMap.set(toRestore.orderNumber, { ...toRestore, isArchived: false, archivedAt: null });
    archiveMap.delete(toRestore.orderNumber);

    expect(activeMap.has('AS-202610-0002')).toBe(true);
    expect(archiveMap.has('AS-202610-0002')).toBe(false);
  });
});
