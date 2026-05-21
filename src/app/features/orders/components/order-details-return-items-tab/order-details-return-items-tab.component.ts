import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { finalize, take } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import type { Order } from '../../models/order.entity';
import type { AddReturnItemsRequest } from '../../models/add-return-items.request';
import { ORDER_ACTION_UI } from '../../models/order-actions';
import {
  canReturnOrderItems,
  mapReturnItemsRequestToUi
} from '../../models/order-return-items';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderReturnItemsDialogComponent } from '../order-return-items-dialog/order-return-items-dialog.component';
import { OrdersApiService } from '../../services/orders-api.service';

@Component({
  selector: 'app-order-details-return-items-tab',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, OrderReturnItemsDialogComponent],
  templateUrl: './order-details-return-items-tab.component.html'
})
export class OrderDetailsReturnItemsTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');
  readonly recordingDisabled = input(false);

  readonly returnItemsRecorded = output<{
    request: AddReturnItemsRequest;
    result: Order;
  }>();

  readonly ORDER_ACTION_UI = ORDER_ACTION_UI;
  readonly canReturnOrderItems = canReturnOrderItems;

  private readonly ordersApi = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);

  readonly dialogVisible = model(false);
  readonly returnSaving = signal(false);

  readonly helperText = computed(() =>
    canReturnOrderItems(this.order())
      ? 'Quantities recorded as returned for this shipped order.'
      : 'View return quantities for this order. Recording is available when the order is shipped.'
  );

  openRecordDialog(): void {
    this.dialogVisible.set(true);
  }

  submitReturnItems(request: AddReturnItemsRequest): void {
    const id = this.order().id;
    const isEdit = this.order().returnItems.length > 0;

    this.returnSaving.set(true);
    this.ordersApi
      .addReturnItems(id, request)
      .pipe(
        take(1),
        finalize(() => this.returnSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add(presentApiError(res.error).toast);
            return;
          }
          this.dialogVisible.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit
              ? 'Return items updated successfully.'
              : 'Return items recorded successfully.'
          });
          this.returnItemsRecorded.emit({ request, result: res.result });
        },
        error: (err: unknown) => {
          this.messageService.add(presentApiError(err).toast);
        }
      });
  }
}
