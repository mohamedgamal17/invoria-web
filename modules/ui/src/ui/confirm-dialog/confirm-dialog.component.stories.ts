import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';

const meta: Meta<ConfirmDialogComponent> = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialogComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [ConfirmationService, ConfirmDialogService],
    }),
  ],
};

export default meta;
type Story = StoryObj<ConfirmDialogComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="p-6">
        <p class="text-sm text-muted-foreground mb-4">
          This dialog host listens to ConfirmDialogService throughout the app.
        </p>
        <app-confirm-dialog />
      </div>
    `,
  }),
};
