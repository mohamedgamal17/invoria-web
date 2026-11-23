import type { Meta, StoryObj } from '@storybook/angular';
import { DetailsSkeletonComponent } from './details-skeleton.component';

const meta: Meta<DetailsSkeletonComponent> = {
  title: 'UI/DetailsSkeleton',
  component: DetailsSkeletonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DetailsSkeletonComponent>;

export const Default: Story = {};
