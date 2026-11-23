import type { Meta, StoryObj } from '@storybook/angular';
import { ReturnHeaderComponent } from './return-header.component';

const meta: Meta<ReturnHeaderComponent> = {
  title: 'Sales/Returns/ReturnHeader',
  component: ReturnHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReturnHeaderComponent>;

export const Default: Story = {};
