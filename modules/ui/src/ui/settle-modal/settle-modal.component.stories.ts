import type { Meta, StoryObj } from '@storybook/angular';
import { SettleModalComponent } from './settle-modal.component';

const meta: Meta<SettleModalComponent> = {
  title: 'UI/SettleModal',
  component: SettleModalComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SettleModalComponent>;

export const OpenModal: Story = {
  args: {
    visible: true,
    outstandingAmount: 4850.5,
    currencyCode: 'EGP',
    settling: false,
  },
};

export const InProgressSettling: Story = {
  args: {
    visible: true,
    outstandingAmount: 12000,
    currencyCode: 'EGP',
    settling: true,
  },
};
