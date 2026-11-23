import type { Meta, StoryObj } from '@storybook/angular';
import { OrderProfitMetricsListComponent } from './order-profit-metrics-list.component';
import { ReportPeriod } from '@invoria/utils';
import type { OrderSalesProfitReportPeriod } from '../../models/order-report.entity';

const sampleRows: OrderSalesProfitReportPeriod[] = [
  {
    date: '2026-11-20T00:00:00Z',
    totalRevenue: 85000,
    totalCost: 52000,
    totalProfit: 33000,
    totalReturnAmount: 2500,
    period: ReportPeriod.Daily,
  },
  {
    date: '2026-11-21T00:00:00Z',
    totalRevenue: 120000,
    totalCost: 75000,
    totalProfit: 45000,
    totalReturnAmount: 0,
    period: ReportPeriod.Daily,
  },
];

const meta: Meta<OrderProfitMetricsListComponent> = {
  title: 'Sales/Orders/OrderProfitMetricsList',
  component: OrderProfitMetricsListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderProfitMetricsListComponent>;

export const Default: Story = {
  args: {
    rows: sampleRows,
    totalRecords: sampleRows.length,
    first: 0,
    pageSize: 10,
    loading: false,
    selectedPeriod: ReportPeriod.Daily,
  },
};

export const Loading: Story = {
  args: {
    rows: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    loading: true,
    selectedPeriod: ReportPeriod.Daily,
  },
};

export const Empty: Story = {
  args: {
    rows: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    loading: false,
    selectedPeriod: ReportPeriod.Daily,
  },
};
