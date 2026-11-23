import type { Meta, StoryObj } from '@storybook/angular';
import { ChartCardComponent } from './chart-card.component';
import { ReportPeriod } from '@invoria/utils';
import type { EChartsCoreOption } from 'echarts/core';

const sampleChartOptions: EChartsCoreOption = {
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Sales Revenue',
      type: 'line',
      smooth: true,
      data: [12000, 19000, 15000, 22000, 31000, 28000, 36000],
      itemStyle: { color: '#0ea5e9' },
    },
  ],
};

const meta: Meta<ChartCardComponent> = {
  title: 'UI/ChartCard',
  component: ChartCardComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ChartCardComponent>;

export const WithData: Story = {
  args: {
    title: 'Weekly Sales Revenue',
    subtitle: 'Revenue generated across the past 7 days',
    options: sampleChartOptions,
    loading: false,
    showPeriodSelector: false,
  },
};

export const WithPeriodSelector: Story = {
  args: {
    title: 'Revenue Aggregation',
    subtitle: 'Select period granularity',
    options: sampleChartOptions,
    showPeriodSelector: true,
    selectedPeriod: ReportPeriod.Daily,
    loading: false,
  },
};

export const EmptyState: Story = {
  args: {
    title: 'Monthly Order Volumes',
    subtitle: 'No data recorded for the selected range',
    options: null,
    emptyText: 'No orders recorded for this period',
    loading: false,
    showPeriodSelector: true,
    selectedPeriod: ReportPeriod.Monthly,
  },
};

export const LoadingState: Story = {
  args: {
    title: 'Annual Performance',
    subtitle: 'Fetching performance metrics...',
    options: null,
    loading: true,
    showPeriodSelector: false,
  },
};
