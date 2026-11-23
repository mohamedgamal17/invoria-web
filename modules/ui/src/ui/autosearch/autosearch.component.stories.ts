import type { Meta, StoryObj } from '@storybook/angular';
import { AutosearchComponent } from './autosearch.component';

interface ItemOption {
  id: string;
  name: string;
}

const sampleItems: ItemOption[] = [
  { id: 'item_1', name: 'Logitech MX Master 3S' },
  { id: 'item_2', name: 'Keychron K2 Mechanical Keyboard' },
  { id: 'item_3', name: 'Dell UltraSharp 27" 4K Monitor' },
  { id: 'item_4', name: 'CalDigit TS4 Thunderbolt Dock' },
];

const meta: Meta<AutosearchComponent<ItemOption>> = {
  title: 'UI/Autosearch',
  component: AutosearchComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AutosearchComponent<ItemOption>>;

export const DefaultEmpty: Story = {
  args: {
    controlName: 'productSearch',
    placeholder: 'Search product by name or SKU...',
    suggestions: sampleItems,
    field: 'name',
    dataKey: 'id',
    disabled: false,
  },
};

export const WithSelectedValue: Story = {
  args: {
    controlName: 'productSearch',
    selected: sampleItems[0],
    placeholder: 'Search product...',
    suggestions: sampleItems,
    field: 'name',
    dataKey: 'id',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    controlName: 'productSearch',
    selected: sampleItems[1],
    disabled: true,
    suggestions: [],
    field: 'name',
    dataKey: 'id',
  },
};
