import { describe, it, expect } from 'vitest';
import { canTransitionOrderStatus, canTransitionPaymentStatus } from '../src/lib/state-machines';

describe('Order & COD Settlement State Machine Transitions (E2, E10)', () => {
  it('allows valid order fulfillment progression', () => {
    // PENDING_CONFIRMATION -> CONFIRMED
    expect(canTransitionOrderStatus('PENDING_CONFIRMATION', 'CONFIRMED')).toBe(true);
    // CONFIRMED -> PROCESSING
    expect(canTransitionOrderStatus('CONFIRMED', 'PROCESSING')).toBe(true);
    // PROCESSING -> OUT_FOR_DELIVERY
    expect(canTransitionOrderStatus('PROCESSING', 'OUT_FOR_DELIVERY')).toBe(true);
    // OUT_FOR_DELIVERY -> DELIVERED
    expect(canTransitionOrderStatus('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
  });

  it('allows cancellation prior to courier delivery', () => {
    expect(canTransitionOrderStatus('PENDING_CONFIRMATION', 'CANCELLED')).toBe(true);
    expect(canTransitionOrderStatus('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(canTransitionOrderStatus('PROCESSING', 'CANCELLED')).toBe(true);
  });

  it('blocks invalid order transitions', () => {
    // Cannot jump from PENDING directly to DELIVERED
    expect(canTransitionOrderStatus('PENDING_CONFIRMATION', 'DELIVERED')).toBe(false);
    // Terminal state DELIVERED cannot transition to CANCELLED
    expect(canTransitionOrderStatus('DELIVERED', 'CANCELLED')).toBe(false);
    // CANCELLED cannot transition to PROCESSING
    expect(canTransitionOrderStatus('CANCELLED', 'PROCESSING')).toBe(false);
  });

  it('verifies COD cash collection lifecycle transitions', () => {
    expect(canTransitionPaymentStatus('PENDING_COLLECTION', 'COLLECTED_BY_COURIER')).toBe(true);
    expect(canTransitionPaymentStatus('COLLECTED_BY_COURIER', 'REMITTED_TO_STORE')).toBe(true);
    expect(canTransitionPaymentStatus('PENDING_COLLECTION', 'FAILED_COLLECTION')).toBe(true);

    // Cannot remit to store without courier collecting first
    expect(canTransitionPaymentStatus('PENDING_COLLECTION', 'REMITTED_TO_STORE')).toBe(false);
  });
});
