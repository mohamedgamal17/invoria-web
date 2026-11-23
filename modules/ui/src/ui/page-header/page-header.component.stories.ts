import type { Meta, StoryObj } from '@storybook/angular';
import { PageHeaderComponent } from './page-header.component';

const meta: Meta<PageHeaderComponent> = {
  title: 'UI/PageHeader',
  component: PageHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PageHeaderComponent>;

export const Default: Story = {
  args: {
    title: 'Customer Directory',
    description: 'Manage registered clients, credit lines, and contact info',
    eyebrow: 'Operations',
    eyebrowIcon: 'pi pi-users',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Orders Management',
    description: 'Track, fulfill, and review customer purchase orders',
    eyebrow: 'Sales',
    eyebrowIcon: 'pi pi-shopping-cart',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-page-header
        [title]="title"
        [description]="description"
        [eyebrow]="eyebrow"
        [eyebrowIcon]="eyebrowIcon"
      >
        <button class="px-4 py-2 text-sm font-medium rounded-lg bg-surface border border-border text-foreground hover:bg-surface-2 transition">
          <i class="pi pi-download mr-1.5"></i> Export
        </button>
        <button class="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
          <i class="pi pi-plus mr-1.5"></i> New Order
        </button>
      </app-page-header>
    `,
  }),
};
