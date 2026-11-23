import type { Meta, StoryObj } from '@storybook/angular';
import { SettlementsTabComponent } from './settlements-tab.component';
import type { FinancialSettlement } from '@invoria/utils';

const sampleSettlements: FinancialSettlement[] = [
  {
    id: 'set_1',
    amount: 1500,
    settledAt: '2026-11-20T14:30:00Z',
  },
  {
    id: 'set_2',
    amount: 2000,
    settledAt: '2026-11-15T09:15:00Z',
  },
];

const meta: Meta<SettlementsTabComponent> = {
  title: 'UI/SettlementsTab',
  component: SettlementsTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SettlementsTabComponent>;

export const WithSettlements: Story = {
  args: {
    settlements: sampleSettlements,
    currencyCode: 'EGP',
    outstandingAmount: 2500,
    entityName: 'payable',
  },
};

export const FullySettled: Story = {
  args: {
    settlements: sampleSettlements,
    currencyCode: 'EGP',
    outstandingAmount: 0,
    entityName: 'invoice',
  },
};

export const Empty: Story = {
  args: {
    settlements: [],
    currencyCode: 'EGP',
    outstandingAmount: 5000,
    entityName: 'receivable',
  },
};
