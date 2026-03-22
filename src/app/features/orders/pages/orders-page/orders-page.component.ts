import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

import { OrdersMockApiService } from '../../services/orders-mock-api.service';
import type { Order, OrderCreateInput, OrderStatus } from '../../models/order';

type OrderDraft = {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  orderDate: Date;
};

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    ProgressSpinnerModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    PaginatorModule,
    SelectModule,
    DatePickerModule
  ],
  providers: [MessageService],
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent implements OnInit {
  readonly pageSizeOptions = [5, 10, 20];
  readonly statusOptions: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  orders: Order[] = [];
  totalRecords = 0;

  pageIndex = 0;
  pageSize = 10;

  isListLoading = true;

  modalVisible = false;
  modalMode: ModalMode = 'create';
  modalSaving = false;
  private editingId: string | null = null;

  draft: OrderDraft = {
    orderNumber: '',
    customerName: '',
    totalAmount: 0,
    status: 'Pending',
    orderDate: new Date()
  };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly ordersApi: OrdersMockApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const page = params['page'] ? parseInt(params['page'], 10) : 1;
        const newPageIndex = Math.max(0, page - 1);
        
        if (this.pageIndex !== newPageIndex || this.isListLoading) {
          this.pageIndex = newPageIndex;
          void this.loadOrders();
        }
      });
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize }, (_, i) => i);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.editingId = null;
    this.draft = {
      orderNumber: '',
      customerName: '',
      totalAmount: 0,
      status: 'Pending',
      orderDate: new Date()
    };
    this.modalVisible = true;
  }

  openEditModal(order: Order): void {
    this.modalMode = 'edit';
    this.editingId = order.id;
    this.draft = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: new Date(order.orderDate)
    };
    this.modalVisible = true;
  }

  onModalHide(): void {
    this.modalSaving = false;
  }

  async submitModal(): Promise<void> {
    this.modalSaving = true;

    const input: OrderCreateInput = {
      orderNumber: this.draft.orderNumber,
      customerName: this.draft.customerName,
      totalAmount: this.draft.totalAmount,
      status: this.draft.status,
      orderDate: this.draft.orderDate.toISOString()
    };

    try {
      if (this.modalMode === 'create') {
        await firstValueFrom(this.ordersApi.createOrder(input));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order created successfully.' });
      } else {
        if (!this.editingId) throw new Error('Missing order id.');
        await firstValueFrom(this.ordersApi.updateOrder(this.editingId, input));
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order updated successfully.' });
      }

      this.modalVisible = false;
      await this.loadOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    } finally {
      this.modalSaving = false;
    }
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  async deleteOrder(order: Order): Promise<void> {
    if (!confirm(`Are you sure you want to delete order "${order.orderNumber}"?`)) return;

    try {
      await firstValueFrom(this.ordersApi.deleteOrder(order.id));
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order deleted successfully.' });
      await this.loadOrders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }
  }

  async onPageChange(event: any): Promise<void> {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize;
    const newPageIndex = Math.floor(first / Math.max(rows, 1));
    
    if (this.pageIndex !== newPageIndex || this.pageSize !== rows) {
      const isPageSizeChangeOnly = this.pageIndex === newPageIndex && this.pageSize !== rows;
      this.pageSize = rows;
      
      const isManualPageChange = this.pageIndex !== newPageIndex;
      
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1 },
        queryParamsHandling: 'merge',
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isPageSizeChangeOnly) {
        await this.loadOrders();
      }
    }
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'warn';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private async loadOrders(): Promise<void> {
    this.isListLoading = true;
    this.orders = [];

    try {
      const result = await firstValueFrom(this.ordersApi.listOrders(this.pageIndex, this.pageSize));
      this.orders = result.items;
      this.totalRecords = result.total;
    } catch (err: unknown) {
      this.orders = [];
      this.totalRecords = 0;
      const message = err instanceof Error ? err.message : 'Unexpected error.';
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    } finally {
      this.isListLoading = false;
      this.cdr.detectChanges();
    }
  }
}
