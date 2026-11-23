import type { Meta, StoryObj } from '@storybook/angular';
import { SurfaceCardComponent } from './surface-card.component';

const meta: Meta<SurfaceCardComponent> = {
  title: 'UI/SurfaceCard',
  component: SurfaceCardComponent,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: { type: 'select' },
      options: ['neutral', 'accent'],
    },
  },
};

export default meta;
type Story = StoryObj<SurfaceCardComponent>;

export const Default: Story = {
  args: {
    tone: 'neutral',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-surface-card [tone]="tone">
        <h3 class="text-base font-semibold text-foreground">Surface Card Title</h3>
        <p class="text-sm text-muted-foreground mt-1">This is a neutral surface card container with projected content.</p>
      </app-surface-card>
    `,
  }),
};

export const AccentTone: Story = {
  args: {
    tone: 'accent',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-surface-card [tone]="tone">
        <h3 class="text-base font-semibold text-primary">Accent Surface Card</h3>
        <p class="text-sm text-muted-foreground mt-1">Highlighted surface container for featured panels.</p>
      </app-surface-card>
    `,
  }),
};
