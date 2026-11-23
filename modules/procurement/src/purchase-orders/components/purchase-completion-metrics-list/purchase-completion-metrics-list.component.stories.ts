import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseCompletionMetricsListComponent } from './purchase-completion-metrics-list.component';
import { ReportPeriod } from '@invoria/utils';
import type { PurchaseCompletionReportPeriod } from '../../models/purchase-order-report.entity';

const sampleRows: PurchaseCompletionReportPeriod[] = [
  { date: '2026-11-20T00:00:00Z', totalCount: 12, period: ReportPeriod.Daily },
  { date: '2026-11-21T00:00:00Z', totalCount: 18, period: ReportPeriod.Daily },
  { date: '2026-11-22T00:00:00Z', totalCount: 8, period: ReportPeriod.Daily },
];

const meta: Meta<PurchaseCompletionMetricsListComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseCompletionMetricsList',
  component: PurchaseCompletionMetricsListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseCompletionMetricsListComponent>;

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
