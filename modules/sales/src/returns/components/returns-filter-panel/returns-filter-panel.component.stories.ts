import type { Meta, StoryObj } from '@storybook/angular';
import { ReturnsFilterPanelComponent } from './returns-filter-panel.component';

const meta: Meta<ReturnsFilterPanelComponent> = {
  title: 'Sales/Returns/ReturnsFilterPanel',
  component: ReturnsFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReturnsFilterPanelComponent>;

export const Default: Story = {
  args: {
    type: null,
    loading: false,
  },
};

export const FilterSelected: Story = {
  args: {
    type: 1,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    type: null,
    loading: true,
  },
};
