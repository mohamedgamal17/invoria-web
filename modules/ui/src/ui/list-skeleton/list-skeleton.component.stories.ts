import type { Meta, StoryObj } from '@storybook/angular';
import { ListSkeletonComponent, DEFAULT_LIST_SKELETON_COLUMNS } from './list-skeleton.component';

const meta: Meta<ListSkeletonComponent> = {
  title: 'UI/ListSkeleton',
  component: ListSkeletonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ListSkeletonComponent>;

export const MobileCardsVariant: Story = {
  args: {
    variant: 'mobile',
    count: 3,
  },
};

export const TableRowsVariant: Story = {
  args: {
    variant: 'table',
    count: 4,
    columns: DEFAULT_LIST_SKELETON_COLUMNS,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="overflow-x-auto rounded-xl border border-border bg-surface">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-border bg-surface-2 text-muted-foreground">
              <th class="px-4 py-3">Item</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">SKU</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Qty</th>
              <th class="px-4 py-3">Price</th>
              <th class="px-4 py-3">Updated</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <app-list-skeleton [variant]="variant" [count]="count" [columns]="columns" />
          </tbody>
        </table>
      </div>
    `,
  }),
};
