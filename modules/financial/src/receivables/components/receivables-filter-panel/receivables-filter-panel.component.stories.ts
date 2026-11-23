import type { Meta, StoryObj } from '@storybook/angular';
import { ReceivablesFilterPanelComponent } from './receivables-filter-panel.component';

const meta: Meta<ReceivablesFilterPanelComponent> = {
  title: 'Financial/Receivables/ReceivablesFilterPanel',
  component: ReceivablesFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReceivablesFilterPanelComponent>;

export const DefaultEmpty: Story = {
  args: {
    partyId: '',
    sourceId: '',
    isPaid: null,
    loading: false,
  },
};

export const Filtered: Story = {
  args: {
    partyId: 'Cairo Retail',
    sourceId: 'ORD-2026',
    isPaid: false,
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    partyId: '',
    sourceId: '',
    isPaid: null,
    loading: true,
  },
};
