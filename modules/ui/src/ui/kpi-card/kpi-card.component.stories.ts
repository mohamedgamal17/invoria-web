import type { Meta, StoryObj } from '@storybook/angular';
import { KpiCardComponent } from './kpi-card.component';
import { Package, TrendingUp, AlertTriangle } from 'lucide-angular';

const meta: Meta<KpiCardComponent> = {
  title: 'UI/KpiCard',
  component: KpiCardComponent,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: { type: 'select' },
      options: ['primary', 'success', 'warning', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj<KpiCardComponent>;

export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: 125400,
    hint: '+12.5% from last month',
    tone: 'primary',
    loading: false,
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Active Products',
    value: 342,
    hint: 'Catalog inventory items',
    icon: Package,
    iconSize: 28,
    tone: 'success',
    loading: false,
  },
};

export const Trending: Story = {
  args: {
    title: 'Completed Orders',
    value: 1845,
    hint: '32 orders today',
    icon: TrendingUp,
    iconSize: 28,
    tone: 'primary',
    loading: false,
  },
};

export const WarningTone: Story = {
  args: {
    title: 'Low Stock Alerts',
    value: 14,
    hint: 'Items below threshold',
    icon: AlertTriangle,
    iconSize: 28,
    tone: 'warning',
    loading: false,
  },
};

export const DangerTone: Story = {
  args: {
    title: 'Overdue Receivables',
    value: 7,
    hint: 'Requires immediate collection',
    tone: 'danger',
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    title: 'Monthly Volume',
    value: 0,
    loading: true,
  },
};

export const StringValue: Story = {
  args: {
    title: 'System Health',
    value: 'Optimal',
    hint: 'All services connected',
    tone: 'success',
    loading: false,
  },
};
