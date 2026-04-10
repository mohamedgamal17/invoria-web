import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-customer-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './customer-form-dialog.component.html'
})
export class CustomerFormDialogComponent {
  visible = model(false);
  mode = input<'create' | 'edit'>('create');
  saving = input(false);
  name = input('');
  nameChange = output<string>();

  submit = output<void>();
  cancel = output<void>();
  hide = output<void>();

  onDialogHide(): void {
    this.visible.set(false);
    this.hide.emit();
  }

  onCancel(): void {
    this.visible.set(false);
    this.cancel.emit();
  }

  onFormSubmit(event: Event): void {
    event.preventDefault();
    this.submit.emit();
  }
}
