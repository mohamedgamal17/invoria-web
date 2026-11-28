import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { IvLabelComponent } from '../label';
import { IvFloatLabelComponent } from './index';

const INPUT_CLASS =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary';

const meta: Meta<IvFloatLabelComponent> = {
  title: 'UI/Forms/IvFloatLabel',
  component: IvFloatLabelComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [IvLabelComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['over', 'in', 'on'],
    },
    styleClass: { control: 'text' },
  },
  args: {
    variant: 'over',
    styleClass: '',
  },
};

export default meta;
type Story = StoryObj<IvFloatLabelComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, inputClass: INPUT_CLASS },
    template: `
      <div class="pt-4 max-w-xs">
        <iv-float-label [variant]="variant" [styleClass]="styleClass">
          <input id="float-default" type="text" placeholder=" " [class]="inputClass" />
          <label for="float-default">Username</label>
        </iv-float-label>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    props: { inputClass: INPUT_CLASS },
    template: `
      <div class="flex flex-col gap-6 pt-4 max-w-xs">
        <iv-float-label variant="over">
          <input id="float-over" type="text" placeholder=" " [class]="inputClass" />
          <label for="float-over">Over Variant</label>
        </iv-float-label>

        <iv-float-label variant="in">
          <input id="float-in" type="text" placeholder=" " [class]="inputClass" />
          <label for="float-in">In Variant</label>
        </iv-float-label>

        <iv-float-label variant="on">
          <input id="float-on" type="text" placeholder=" " [class]="inputClass" />
          <label for="float-on">On Variant</label>
        </iv-float-label>
      </div>
    `,
  }),
};

export const WithIvLabel: Story = {
  render: () => ({
    props: { inputClass: INPUT_CLASS },
    template: `
      <div class="flex flex-col gap-6 pt-4 max-w-xs">
        <iv-float-label variant="on">
          <input id="float-iv-label" type="text" placeholder=" " [class]="inputClass" />
          <iv-label htmlFor="float-iv-label" [required]="true" text="Email Address" />
        </iv-float-label>

        <iv-float-label variant="in">
          <input id="float-iv-label-filled" type="text" value="jane@invoria.app" placeholder=" " [class]="inputClass" />
          <iv-label htmlFor="float-iv-label-filled" text="Pre-filled Email" />
        </iv-float-label>
      </div>
    `,
  }),
};

export const AnyInputAndTextarea: Story = {
  render: () => ({
    props: { inputClass: INPUT_CLASS },
    template: `
      <div class="flex flex-col gap-6 pt-4 max-w-xs">
        <iv-float-label variant="over">
          <input id="float-no-placeholder" type="text" [class]="inputClass" />
          <label for="float-no-placeholder">Input without placeholder</label>
        </iv-float-label>

        <iv-float-label variant="on">
          <input id="float-with-placeholder" type="text" placeholder="e.g. Acme Corp" [class]="inputClass" />
          <label for="float-with-placeholder">Company (focus reveals placeholder)</label>
        </iv-float-label>

        <iv-float-label variant="in">
          <textarea id="float-textarea" rows="3" [class]="inputClass"></textarea>
          <iv-label htmlFor="float-textarea" text="Notes" />
        </iv-float-label>
      </div>
    `,
  }),
};
