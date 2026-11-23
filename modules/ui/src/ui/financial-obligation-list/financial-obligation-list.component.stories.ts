import type { Meta, StoryObj } from '@storybook/angular';
import { FinancialObligationListComponent } from './financial-obligation-list.component';
import type { FinancialObligation } from '@invoria/utils';
import { FinancialObligationStatus } from '@invoria/utils';

const sampleObligations: FinancialObligation[] = [
  {
    id: 'pay_1',
    partyId: 'sup_101',
    sourceId: 'po_501',
    party: { id: 'sup_101', name: 'Cairo Paper Mills' },
    source: { id: 'po_501', purchaseNumber: 'PO-2026-0031' },
    amount: 45000,
    outstandingAmount: 15000,
    status: FinancialObligationStatus.PartiallyPaid,
    createdAt: '2026-11-01T10:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-10T14:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'pay_2',
    partyId: 'sup_102',
    sourceId: 'po_502',
    party: { id: 'sup_102', name: 'Delta Packaging Ltd' },
    source: { id: 'po_502', purchaseNumber: 'PO-2026-0032' },
    amount: 12000,
    outstandingAmount: 12000,
    status: FinancialObligationStatus.Outstanding,
    createdAt: '2026-11-05T09:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-05T09:30:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'pay_3',
    partyId: 'sup_103',
    sourceId: 'po_503',
    party: { id: 'sup_103', name: 'Alex Chemical Co' },
    source: { id: 'po_503', purchaseNumber: 'PO-2026-0033' },
    amount: 8500,
    outstandingAmount: 0,
    status: FinancialObligationStatus.Paid,
    createdAt: '2026-10-15T11:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-10-25T16:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<FinancialObligationListComponent> = {
  title: 'UI/FinancialObligationList',
  component: FinancialObligationListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FinancialObligationListComponent>;

export const WithObligations: Story = {
  args: {
    obligations: sampleObligations,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    isListLoading: false,
    entityPlural: 'payables',
    partyLabel: 'Supplier',
    sourceLabel: 'Purchase Order',
    sourceDisplayKey: 'purchaseNumber',
    currencyCode: 'EGP',
  },
};

export const LoadingState: Story = {
  args: {
    obligations: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    isListLoading: true,
    entityPlural: 'payables',
    partyLabel: 'Supplier',
    sourceLabel: 'Purchase Order',
    sourceDisplayKey: 'purchaseNumber',
    currencyCode: 'EGP',
  },
};

export const EmptyState: Story = {
  args: {
    obligations: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    isListLoading: false,
    entityPlural: 'receivables',
    partyLabel: 'Customer',
    sourceLabel: 'Sales Order',
    sourceDisplayKey: 'orderNumber',
    currencyCode: 'EGP',
  },
};
