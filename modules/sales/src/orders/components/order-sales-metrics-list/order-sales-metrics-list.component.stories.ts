import type { Meta, StoryObj } from '@storybook/angular';
import { OrderSalesMetricsListComponent } from './order-sales-metrics-list.component';
import { ReportPeriod } from '@invoria/utils';
import type { OrderSalesReportPeriod } from '../../models/order-report.entity';

const sampleRows: OrderSalesReportPeriod[] = [
  {
    date: '2026-11-20T00:00:00Z',
    totalAmount: 95000,
    totalNetAmount: 92500,
    totalReturnAmount: 2500,
    period: ReportPeriod.Daily,
  },
  {
    date: '2026-11-21T00:00:00Z',
    totalAmount: 135000,
    totalNetAmount: 135000,
    totalReturnAmount: 0,
    period: ReportPeriod.Daily,
  },
];

const meta: Meta<OrderSalesMetricsListComponent> = {
  title: 'Sales/Orders/OrderSalesMetricsList',
  component: OrderSalesMetricsListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderSalesMetricsListComponent>;

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
