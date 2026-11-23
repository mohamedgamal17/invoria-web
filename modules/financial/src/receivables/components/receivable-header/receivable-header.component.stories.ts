import type { Meta, StoryObj } from '@storybook/angular';
import { ReceivableHeaderComponent } from './receivable-header.component';

const meta: Meta<ReceivableHeaderComponent> = {
  title: 'Financial/Receivables/ReceivableHeader',
  component: ReceivableHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReceivableHeaderComponent>;

export const Default: Story = {};
