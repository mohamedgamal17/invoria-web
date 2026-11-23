import type { Meta, StoryObj } from '@storybook/angular';
import { ReportPeriodFilterPanelComponent } from './report-period-filter-panel.component';
import { ReportPeriod } from '@invoria/utils';

const meta: Meta<ReportPeriodFilterPanelComponent> = {
  title: 'UI/ReportPeriodFilterPanel',
  component: ReportPeriodFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReportPeriodFilterPanelComponent>;

export const DailyPeriod: Story = {
  args: {
    period: ReportPeriod.Daily,
    loading: false,
    inputId: 'report-period-daily',
  },
};

export const MonthlyPeriod: Story = {
  args: {
    period: ReportPeriod.Monthly,
    loading: false,
    inputId: 'report-period-monthly',
  },
};

export const LoadingState: Story = {
  args: {
    period: ReportPeriod.Yearly,
    loading: true,
    inputId: 'report-period-loading',
  },
};
