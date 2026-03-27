import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Batch, BatchState } from '../models/batch.model';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    PaginatorModule,
    CardModule,
    SkeletonModule
  ],
  template: `
    <div class="flex h-full min-h-0 flex-col">
      <!-- Desktop -->
      <div class="hidden h-full min-h-0 md:block">
        <p-table
          [value]="batches()"
          [paginator]="true"
          [rows]="pageSize()"
          [totalRecords]="totalRecords()"
          [lazy]="true"
          [loading]="loading()"
          [showLoader]="false"
          (onLazyLoad)="onPageChange.emit($event)"
          styleClass="p-datatable-sm w-full">

          <ng-template pTemplate="header">
            <tr>
              <th class="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Actual quantity
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Reserved
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Purchase price
              </th>
              <th class="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th class="w-12 px-3 py-2"></th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-batch>
            <tr>
              <td class="px-3 py-3 align-top">
                <div class="flex flex-col gap-0.5">
                  <span class="text-base font-extrabold tabular-nums text-foreground">
                    {{ getAvailableQuantity(batch) }}
                  </span>
                  <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    available
                  </span>
                </div>
              </td>
              <td class="px-3 py-3 align-top">
                <div class="flex flex-col gap-0.5">
                  <span class="tabular-nums text-foreground">{{ batch.reservedQuantity }}</span>
                  <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    reserved
                  </span>
                </div>
              </td>
              <td class="px-3 py-3 font-bold tabular-nums text-foreground">{{ batch.purchasePrice | currency }}</td>
              <td class="px-3 py-3">
                <p-tag [value]="batch.state" [severity]="getSeverity(batch.state)"></p-tag>
              </td>
              <td class="px-3 py-3 text-right">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
                  (onClick)="edit.emit(batch)">
                </p-button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="loadingbody">
            <tr>
              <td class="px-3 py-3 align-top">
                <div class="flex flex-col gap-1">
                  <p-skeleton width="3rem" height="1.25rem"></p-skeleton>
                  <p-skeleton width="2rem" height="0.65rem"></p-skeleton>
                </div>
              </td>
              <td class="px-3 py-3">
                <p-skeleton width="2.5rem" height="1rem"></p-skeleton>
              </td>
              <td class="px-3 py-3">
                <p-skeleton width="5.5rem" height="1rem"></p-skeleton>
              </td>
              <td class="px-3 py-3">
                <p-skeleton width="4.5rem" height="1.5rem" borderRadius="9999px"></p-skeleton>
              </td>
              <td class="px-3 py-3 text-right">
                <p-skeleton width="2rem" height="2rem" borderRadius="9999px"></p-skeleton>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="px-4 py-10">
                <div class="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <i class="pi pi-inbox text-4xl opacity-40"></i>
                  <span>No batches tracked for this product yet.</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Mobile -->
      <div class="flex min-h-0 flex-1 flex-col gap-3 md:hidden">
        @if (loading()) {
          <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            @for (skeleton of [1, 2, 3]; track skeleton) {
              <p-card styleClass="border border-border bg-surface shadow-sm">
                <div class="flex flex-col gap-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-col gap-1.5">
                      <p-skeleton width="3.5rem" height="0.65rem"></p-skeleton>
                      <p-skeleton width="4rem" height="1.5rem"></p-skeleton>
                    </div>
                    <p-skeleton width="4.5rem" height="1.5rem" borderRadius="9999px"></p-skeleton>
                  </div>

                  <div class="grid grid-cols-2 gap-3 border-y border-border py-2">
                    <div class="flex flex-col gap-1.5">
                      <p-skeleton width="3rem" height="0.65rem"></p-skeleton>
                      <p-skeleton width="2.5rem" height="1rem"></p-skeleton>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <p-skeleton width="5rem" height="0.65rem"></p-skeleton>
                      <p-skeleton width="5.5rem" height="1rem"></p-skeleton>
                    </div>
                  </div>

                  <p-skeleton width="100%" height="2.25rem" borderRadius="0.5rem"></p-skeleton>
                </div>
              </p-card>
            }
          </div>
        } @else if (batches().length > 0) {
          <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            @for (batch of batches(); track batch.id) {
              <p-card styleClass="border border-border bg-surface shadow-sm">
                <div class="flex flex-col gap-3">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</div>
                      <div class="text-xl font-extrabold tabular-nums text-foreground">{{ batch.quantity }}</div>
                    </div>
                    <p-tag [value]="batch.state" [severity]="getSeverity(batch.state)"></p-tag>
                  </div>

                  <div
                    class="grid grid-cols-2 gap-3 border-y border-border py-2 text-sm text-foreground">
                    <div>
                      <div class="text-[10px] font-bold uppercase text-muted-foreground">Reserved</div>
                      <div class="font-bold tabular-nums">{{ batch.reservedQuantity }}</div>
                    </div>
                    <div>
                      <div class="text-[10px] font-bold uppercase text-muted-foreground">Purchase price</div>
                      <div class="font-bold tabular-nums">{{ batch.purchasePrice | currency }}</div>
                    </div>
                  </div>

                  <p-button
                    label="Edit batch"
                    icon="pi pi-pencil"
                    [text]="true"
                    styleClass="w-full justify-center"
                    (onClick)="edit.emit(batch)">
                  </p-button>
                </div>
              </p-card>
            }
          </div>
        } @else {
          <div
            class="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <i class="pi pi-inbox text-4xl opacity-40"></i>
            <span>No batches tracked for this product yet.</span>
          </div>
        }

        <p-paginator
          [rows]="pageSize()"
          [totalRecords]="totalRecords()"
          (onPageChange)="onPageChange.emit($event)"
          [rowsPerPageOptions]="[5, 10]"
          template="FirstPageLink PreviousPageLink PageLinks NextPageLink LastPageLink"
          styleClass="border-0 bg-transparent py-2">
        </p-paginator>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchListComponent {
  batches = input<Batch[]>([]);
  totalRecords = input<number>(0);
  loading = input<boolean>(false);
  pageSize = input<number>(5);

  onPageChange = output<any>();
  edit = output<Batch>();

  getAvailableQuantity(batch: Batch): number {
    return Math.max(batch.quantity - batch.reservedQuantity, 0);
  }

  getSeverity(state: BatchState): 'success' | 'secondary' | 'danger' | 'info' | 'warn' | undefined {
    switch (state) {
      case BatchState.Active:
        return 'success';
      case BatchState.Depleted:
        return 'secondary';
      case BatchState.Disabled:
        return 'danger';
      default:
        return 'info';
    }
  }
}
