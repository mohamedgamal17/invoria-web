import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { FinancialObligationOverviewCardComponent } from './financial-obligation-overview-card.component';
import type { FinancialObligation } from '@invoria/utils';
import { FinancialObligationStatus } from '@invoria/utils';

const sampleObligation: FinancialObligation = {
  id: 'ob_1',
  partyId: 'party_123',
  sourceId: 'src_456',
  party: { id: 'party_123', name: 'Alpha Industrial Supplies' },
  source: { id: 'src_456', purchaseNumber: 'PO-2026-0042' },
  amount: 25000,
  outstandingAmount: 8500,
  status: FinancialObligationStatus.PartiallyPaid,
  createdAt: '2026-10-10T08:00:00Z',
  createdBy: 'system',
  lastModifiedAt: '2026-11-01T12:00:00Z',
  lastModifiedBy: 'system',
};

const meta: Meta<FinancialObligationOverviewCardComponent> = {
  title: 'UI/FinancialObligationOverviewCard',
  component: FinancialObligationOverviewCardComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<FinancialObligationOverviewCardComponent>;

export const PartialPayable: Story = {
  args: {
    obligation: sampleObligation,
    entityLabel: 'Payable',
    partyLabel: 'Supplier',
    sourceLabel: 'Purchase Order',
    partyRoute: '/procurement/suppliers',
    sourceRoute: '/procurement/purchase-orders',
    sourceDisplayKey: 'purchaseNumber',
    currencyCode: 'EGP',
  },
};

export const UnpaidReceivable: Story = {
  args: {
    obligation: {
      ...sampleObligation,
      amount: 14200,
      outstandingAmount: 14200,
      status: FinancialObligationStatus.Outstanding,
      party: { id: 'cust_789', name: 'Cairo Modern Retail' },
      source: { id: 'ord_999', orderNumber: 'ORD-2026-110' },
    },
    entityLabel: 'Receivable',
    partyLabel: 'Customer',
    sourceLabel: 'Sales Order',
    partyRoute: '/customers',
    sourceRoute: '/sales/orders',
    sourceDisplayKey: 'orderNumber',
    currencyCode: 'EGP',
  },
};

export const Settled: Story = {
  args: {
    obligation: {
      ...sampleObligation,
      outstandingAmount: 0,
      status: FinancialObligationStatus.Paid,
    },
    entityLabel: 'Payable',
    partyLabel: 'Supplier',
    sourceLabel: 'Purchase Order',
    partyRoute: '/procurement/suppliers',
    sourceRoute: '/procurement/purchase-orders',
    sourceDisplayKey: 'purchaseNumber',
    currencyCode: 'EGP',
  },
};
