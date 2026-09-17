import { beforeEach, describe, expect, it } from 'vitest';
import { appActions, appStore } from '../examples/data/appStore.js';
import { documentTotal } from '../examples/data/types.js';
import type { Invoice } from '../examples/data/types.js';

// ROADMAP item 52, issue #22: Billing.tsx's payment-recording action previously always paid an
// invoice's FULL remaining balance — there was no path in the shipped UI to produce a partially-
// paid invoice, and no test (unit or browser) ever exercised one. `appActions.recordPayment`
// itself already applied whatever amount it was given correctly (it only flips `status` to
// `'paid'` once posted payments cover `documentTotal`); the gap was that nothing ever gave it
// less than the full balance. This file tests that data-layer logic directly — no rendering, no
// browser — the balance-due arithmetic every "unpaid"/Receivables screen (Finance.tsx,
// Analytics.tsx, Billing.tsx) shares.
describe('partial payments (ROADMAP item 52, issue #22)', () => {
  beforeEach(() => {
    appActions.reset();
  });

  const balanceDue = (invoice: Invoice) => documentTotal(invoice.lines) - invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);

  it('seeds a genuinely partially-paid invoice (INV-3105): "sent" status, a real non-empty payment, balance short of the full total', () => {
    const invoice = appStore.getState().invoices['INV-3105'];
    expect(invoice).toBeDefined();
    expect(invoice!.status).toBe('sent');
    expect(invoice!.payments.length).toBeGreaterThan(0);

    const total = documentTotal(invoice!.lines);
    const due = balanceDue(invoice!);
    expect(total).toBe(4200);
    expect(due).toBe(2700); // $4,200 total − $1,500 already paid
    expect(due).toBeGreaterThan(0);
    expect(due).toBeLessThan(total); // short of the full original amount, not fully settled
  });

  it('stays correctly visible and correctly totaled under the "unpaid" status filter — not excluded, and not counted at its full original amount', () => {
    // Same `status === 'sent' || status === 'overdue'` definition of "unpaid" Finance.tsx's own
    // Receivables card and Analytics.tsx's own Finance exception count both use.
    const state = appStore.getState();
    const unpaidInvoices = Object.values(state.invoices).filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue');
    const seeded = unpaidInvoices.find((invoice) => invoice.id === 'INV-3105');

    expect(seeded, 'a partially-paid invoice must still be visible under the unpaid filter, not excluded').toBeDefined();
    expect(balanceDue(seeded!)).toBe(2700); // the REMAINING balance, not the $4,200 original amount

    const totalReceivables = unpaidInvoices.reduce((sum, invoice) => sum + balanceDue(invoice), 0);
    // INV-3201 ($10,000, no payments yet) + INV-3105 ($2,700 remaining) — the partial invoice's
    // real remaining balance is genuinely added into the aggregate, not its full original amount.
    expect(totalReceivables).toBe(12700);
  });

  it('recordPayment applies a lesser amount as a genuine partial payment — it does not force full settlement', () => {
    const before = appStore.getState().invoices['INV-3105']!;
    const dueBefore = balanceDue(before);
    const partialAmount = 1000;
    expect(partialAmount).toBeLessThan(dueBefore);

    appActions.recordPayment('INV-3105', { date: '2026-09-17', amount: partialAmount, method: 'Check' });

    const after = appStore.getState().invoices['INV-3105']!;
    expect(after.payments.length).toBe(before.payments.length + 1);
    expect(after.status).toBe('sent'); // still short of the full total — not force-settled to 'paid'
    expect(balanceDue(after)).toBe(dueBefore - partialAmount);
    expect(balanceDue(after)).toBe(1700);
  });

  it('recording the exact remaining balance (not a moment before) settles the invoice to paid', () => {
    const before = appStore.getState().invoices['INV-3105']!;
    const dueBefore = balanceDue(before);

    appActions.recordPayment('INV-3105', { date: '2026-09-17', amount: dueBefore - 1, method: 'Check' });
    expect(appStore.getState().invoices['INV-3105']!.status).toBe('sent');

    appActions.recordPayment('INV-3105', { date: '2026-09-17', amount: 1, method: 'Check' });
    const after = appStore.getState().invoices['INV-3105']!;
    expect(after.status).toBe('paid');
    expect(balanceDue(after)).toBe(0);
  });
});
