import type { Meta, StoryObj } from '@storybook/angular';
import { Info, Mail, User } from 'lucide-angular';
import { IvLabelComponent } from './index';

const meta: Meta<IvLabelComponent> = {
  title: 'UI/Forms/IvLabel',
  component: IvLabelComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    iconPos: {
      control: { type: 'select' },
      options: ['start', 'end'],
    },
    htmlFor: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    text: { control: 'text' },
    styleClass: { control: 'text' },
  },
  args: {
    size: 'md',
    iconPos: 'start',
    htmlFor: 'sample-input',
    required: false,
    disabled: false,
    text: 'Email Address',
  },
};

export default meta;
type Story = StoryObj<IvLabelComponent>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <iv-label size="xs" text="Extra Small (xs)" />
        <iv-label size="sm" text="Small (sm)" />
        <iv-label size="md" text="Medium (md)" />
        <iv-label size="lg" text="Large (lg)" />
        <iv-label size="xl" text="Extra Large (xl)" />
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    props: {
      mailIcon: Mail,
      infoIcon: Info,
      userIcon: User,
    },
    template: `
      <div class="flex flex-col gap-3">
        <iv-label [icon]="mailIcon" iconPos="start" text="Email (start icon)" />
        <iv-label [icon]="infoIcon" iconPos="end" text="API Key (end icon)" />
        <iv-label [icon]="userIcon" iconPos="start" [required]="true" text="Username (required + icon)" />
      </div>
    `,
  }),
};

export const RequiredAndDisabled: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <iv-label text="Required Field" [required]="true" />
        <iv-label text="Disabled Field" [disabled]="true" />
        <iv-label text="Required & Disabled" [required]="true" [disabled]="true" />
      </div>
    `,
  }),
};

export const ProjectedContent: Story = {
  render: () => ({
    template: `
      <iv-label htmlFor="projected-email" [required]="true">
        <span>Projected <strong>HTML</strong> Label</span>
      </iv-label>
    `,
  }),
};
