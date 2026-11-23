import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseSalesMetricsListComponent } from './purchase-sales-metrics-list.component';
import { ReportPeriod } from '@invoria/utils';
import type { PurchaseSalesReportPeriod } from '../../models/purchase-order-report.entity';

const sampleRows: PurchaseSalesReportPeriod[] = [
  {
    date: '2026-11-20T00:00:00Z',
    totalAmount: 145000,
    subTotal: 127000,
    taxAmount: 18000,
    discountAmount: 0,
    period: ReportPeriod.Daily,
  },
  {
    date: '2026-11-21T00:00:00Z',
    totalAmount: 89000,
    subTotal: 78000,
    taxAmount: 11000,
    discountAmount: 0,
    period: ReportPeriod.Daily,
  },
];

const meta: Meta<PurchaseSalesMetricsListComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseSalesMetricsList',
  component: PurchaseSalesMetricsListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseSalesMetricsListComponent>;

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
