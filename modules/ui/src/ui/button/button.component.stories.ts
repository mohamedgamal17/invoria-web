import type { Meta, StoryObj } from '@storybook/angular';
import { ArrowRight, Download, Plus, Save, Trash2 } from 'lucide-angular';
import { IvButtonComponent } from './index';

const meta: Meta<IvButtonComponent> = {
  title: 'UI/IvButton',
  component: IvButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    appearance: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'ghost', 'link'],
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'rounded', 'pill'],
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['start', 'end'],
    },
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
    },
    loading: { control: 'boolean' },
    loadingText: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    text: { control: 'text' },
    styleClass: { control: 'text' },
    ariaLabel: { control: 'text' },
    click: { action: 'clicked' },
  },
  args: {
    size: 'md',
    variant: 'primary',
    appearance: 'solid',
    shape: 'default',
    loading: false,
    loadingText: '',
    disabled: false,
    fullWidth: false,
    iconPosition: 'start',
    text: 'Save Changes',
  },
};

export default meta;
type Story = StoryObj<IvButtonComponent>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button variant="primary" text="Primary" />
        <iv-button variant="secondary" text="Secondary" />
      </div>
    `,
  }),
};

export const Appearances: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <iv-button variant="primary" appearance="solid" text="Primary Solid" />
          <iv-button variant="primary" appearance="outline" text="Primary Outline" />
          <iv-button variant="primary" appearance="ghost" text="Primary Ghost" />
          <iv-button variant="primary" appearance="link" text="Primary Link" />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <iv-button variant="secondary" appearance="solid" text="Secondary Solid" />
          <iv-button variant="secondary" appearance="outline" text="Secondary Outline" />
          <iv-button variant="secondary" appearance="ghost" text="Secondary Ghost" />
          <iv-button variant="secondary" appearance="link" text="Secondary Link" />
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button size="xs" text="Extra Small (xs)" />
        <iv-button size="sm" text="Small (sm)" />
        <iv-button size="md" text="Medium (md)" />
        <iv-button size="lg" text="Large (lg)" />
        <iv-button size="xl" text="Extra Large (xl)" />
      </div>
    `,
  }),
};

export const Shapes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button shape="default" text="Default Shape" />
        <iv-button shape="rounded" text="Rounded Shape" />
        <iv-button shape="pill" text="Pill Shape" />
        <iv-button variant="secondary" appearance="outline" shape="pill" text="Outline Pill" />
      </div>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    props: {
      plusIcon: Plus,
      arrowRightIcon: ArrowRight,
      downloadIcon: Download,
      trashIcon: Trash2,
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button [icon]="plusIcon" iconPosition="start" text="Create Item" />
        <iv-button
          variant="secondary"
          appearance="outline"
          [icon]="arrowRightIcon"
          iconPosition="end"
          text="Continue"
        />
        <iv-button
          variant="primary"
          appearance="ghost"
          [icon]="downloadIcon"
          ariaLabel="Download report"
        />
        <iv-button
          variant="secondary"
          appearance="ghost"
          [icon]="trashIcon"
          ariaLabel="Delete item"
        />
      </div>
    `,
  }),
};

export const Loading: Story = {
  render: () => ({
    props: {
      saveIcon: Save,
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button [loading]="true" text="Save" ariaLabel="Saving" />
        <iv-button [loading]="true" loadingText="Saving..." text="Save" />
        <iv-button variant="primary" appearance="outline" [loading]="true" loadingText="Loading..." />
        <iv-button variant="secondary" [loading]="true" iconPosition="end" loadingText="Submitting" />
        <iv-button [loading]="false" [icon]="saveIcon" text="Ready" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button [disabled]="true" text="Disabled Solid" />
        <iv-button appearance="outline" [disabled]="true" text="Disabled Outline" />
        <iv-button appearance="ghost" [disabled]="true" text="Disabled Ghost" />
        <iv-button appearance="link" [disabled]="true" text="Disabled Link" />
      </div>
    `,
  }),
};

export const HtmlContent: Story = {
  render: () => ({
    props: {
      plusIcon: Plus,
    },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <iv-button [icon]="plusIcon">
          <span>New Order</span>
          <kbd class="ml-1 rounded bg-current/15 px-1.5 py-0.5 text-xs">⌘N</kbd>
        </iv-button>
        <iv-button variant="secondary" appearance="outline" [fullWidth]="false" styleClass="rounded-full">
          <span class="font-semibold">Custom HTML</span>
        </iv-button>
      </div>
    `,
  }),
};

export const LightAndDark: Story = {
  render: () => ({
    template: `
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-border bg-surface p-4 text-foreground">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Light Theme</p>
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <iv-button variant="primary" appearance="solid" text="Solid" />
              <iv-button variant="primary" appearance="outline" text="Outline" />
              <iv-button variant="primary" appearance="ghost" text="Ghost" />
              <iv-button variant="primary" appearance="link" text="Link" />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <iv-button variant="secondary" appearance="solid" text="Solid" />
              <iv-button variant="secondary" appearance="outline" text="Outline" />
              <iv-button variant="secondary" appearance="ghost" text="Ghost" />
              <iv-button variant="secondary" appearance="link" text="Link" />
            </div>
          </div>
        </div>

        <div class="dark rounded-lg border border-border bg-surface p-4 text-foreground">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dark Theme</p>
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <iv-button variant="primary" appearance="solid" text="Solid" />
              <iv-button variant="primary" appearance="outline" text="Outline" />
              <iv-button variant="primary" appearance="ghost" text="Ghost" />
              <iv-button variant="primary" appearance="link" text="Link" />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <iv-button variant="secondary" appearance="solid" text="Solid" />
              <iv-button variant="secondary" appearance="outline" text="Outline" />
              <iv-button variant="secondary" appearance="ghost" text="Ghost" />
              <iv-button variant="secondary" appearance="link" text="Link" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
