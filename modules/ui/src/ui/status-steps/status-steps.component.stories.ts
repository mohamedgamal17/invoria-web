import type { Meta, StoryObj } from '@storybook/angular';
import { StatusStepsComponent, type StatusStep } from './status-steps.component';

const standardOrderSteps: StatusStep[] = [
  { label: 'Pending', icon: 'pi pi-clock' },
  { label: 'Processing', icon: 'pi pi-cog' },
  { label: 'Dispatched', icon: 'pi pi-truck' },
  { label: 'Completed', icon: 'pi pi-check' },
];

const returnStepsWithDanger: StatusStep[] = [
  { label: 'Requested', icon: 'pi pi-file' },
  { label: 'Inspection', icon: 'pi pi-search' },
  { label: 'Rejected', icon: 'pi pi-times', severity: 'danger' },
];

const meta: Meta<StatusStepsComponent> = {
  title: 'UI/StatusSteps',
  component: StatusStepsComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<StatusStepsComponent>;

export const InitialStep: Story = {
  args: {
    steps: standardOrderSteps,
    activeIndex: 0,
    caption: 'Order submitted and awaiting warehouse confirmation',
    pulse: false,
  },
};

export const InProgressPulsing: Story = {
  args: {
    steps: standardOrderSteps,
    activeIndex: 1,
    caption: 'Warehouse is packaging items',
    pulse: true,
  },
};

export const Dispatched: Story = {
  args: {
    steps: standardOrderSteps,
    activeIndex: 2,
    caption: 'Courier on route',
    pulse: false,
  },
};

export const FullyCompleted: Story = {
  args: {
    steps: standardOrderSteps,
    activeIndex: 3,
    caption: 'Delivered and acknowledged',
    pulse: false,
  },
};

export const WithDangerSeverity: Story = {
  args: {
    steps: returnStepsWithDanger,
    activeIndex: 2,
    caption: 'Return rejected due to missing original tags',
    pulse: false,
  },
};
