import type { Meta, StoryObj } from '@storybook/angular';
import { NameFilterPanelComponent } from './name-filter-panel.component';

const meta: Meta<NameFilterPanelComponent> = {
  title: 'UI/NameFilterPanel',
  component: NameFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<NameFilterPanelComponent>;

export const DefaultEmpty: Story = {
  args: {
    name: '',
    loading: false,
    label: 'Customer Name',
    inputId: 'customer-name-filter',
  },
};

export const WithActiveValue: Story = {
  args: {
    name: 'Acme Logistics',
    loading: false,
    label: 'Search by Name',
    inputId: 'name-filter',
  },
};

export const LoadingState: Story = {
  args: {
    name: 'Tech Supplies',
    loading: true,
    label: 'Supplier Name',
    inputId: 'supplier-name-filter',
  },
};
