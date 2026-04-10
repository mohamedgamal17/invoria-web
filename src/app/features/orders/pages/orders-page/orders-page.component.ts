import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { switchMap, tap, catchError, EMPTY } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router, ActivatedRoute } from '@angular/router';

import { OrdersMockApiService } from '../../services/orders-mock-api.service';
import { ProductsMockApiService } from '../../../products/services/products-mock-api.service';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { customerSearchListRequest } from '../../../customers/models/list-customer.request';
import type { Order, OrderCreateInput, OrderState, OrderItem } from '../../models/order';
import type { Product } from '../../../products/models/product';
import type { Customer } from '../../../customers/models/customer.entity';
import { canEditOrder, canTransition } from '../../models/order';

// New Components
import { OrderHeaderComponent } from '../../components/order-header/order-header.component';
import { OrderListComponent } from '../../components/order-list/order-list.component';
import { OrderDialogComponent } from '../../components/order-dialog/order-dialog.component';
import { OrderReasonDialogComponent } from '../../components/order-reason-dialog/order-reason-dialog.component';

type OrderDraft = {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  orderDate: Date;
};

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    OrderHeaderComponent,
    OrderListComponent,
    OrderDialogComponent,
    OrderReasonDialogComponent,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent implements OnInit {
  readonly pageSizeOptions = [5, 10, 20];
  readonly stateOptions: OrderState[] = ['PENDING', 'ACCEPTED', 'REOPENED', 'COMPLETED', 'CANCELLED', 'REFUSED'];

  orders = signal<Order[]>([]);
  totalRecords = signal<number>(0);

  first = signal<number>(0);
  pageSize = signal<number>(10);

  isListLoading = signal<boolean>(true);

  modalVisible = signal<boolean>(false);
  modalMode = signal<ModalMode>('create');
  modalSaving = signal<boolean>(false);
  private editingId: string | null = null;

  reasonModalVisible = signal<boolean>(false);
  reasonText = signal<string>('');
  reasonSaving = signal<boolean>(false);
  protected transitionTarget = signal<{ order: Order; state: OrderState } | null>(null);

  draft = signal<OrderDraft>({
    orderNumber: '',
    customerName: '',
    totalAmount: 0,
    orderDate: new Date()
  });

  // Product Search & Selection
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  itemQuantity = signal<number>(1);
  itemPrice = signal<number>(0);
  draftItems = signal<OrderItem[]>([]);
  isProductLoading = signal<boolean>(false);

  // Customer Search & Selection
  customers = signal<Customer[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  isCustomerLoading = signal<boolean>(false);

  totalItemsCount = computed(() => 
    this.draftItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  skeletonRows = computed(() => 
    Array.from({ length: this.pageSize() }, (_, i) => i)
  );

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly ordersApi: OrdersMockApiService,
    private readonly productsApi: ProductsMockApiService,
    private readonly customersApi: CustomersApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        switchMap(params => {
          const page = params['page'] ? parseInt(params['page'], 10) : 1;
          const size = params['pageSize'] ? parseInt(params['pageSize'], 10) : 10;
          const newPageIndex = Math.max(0, page - 1);
          const newFirst = newPageIndex * size;
          
          this.first.set(newFirst);
          this.pageSize.set(size);
          this.isListLoading.set(true);
          this.orders.set([]);
          
          return this.ordersApi.listOrders(newPageIndex, size).pipe(
            catchError(err => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
              this.orders.set([]);
              this.totalRecords.set(0);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.orders.set(result.items);
        this.totalRecords.set(result.total);
        this.isListLoading.set(false);
        this.cdr.detectChanges();
      });
  }


  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingId = null;
    this.draft.set({
      orderNumber: `ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      customerName: '',
      totalAmount: 0,
      orderDate: new Date()
    });
    this.draftItems.set([]);
    this.selectedProduct.set(null);
    this.selectedCustomer.set(null);
    this.itemQuantity.set(1);
    this.itemPrice.set(0);
    this.modalVisible.set(true);
  }

  canEdit(order: Order): boolean {
    return canEditOrder(order.status);
  }

  canAccept(order: Order): boolean {
    return canTransition(order.status, 'ACCEPTED');
  }

  canCancel(order: Order): boolean {
    return canTransition(order.status, 'CANCELLED');
  }

  canReopen(order: Order): boolean {
    return canTransition(order.status, 'REOPENED');
  }

  canComplete(order: Order): boolean {
    return canTransition(order.status, 'COMPLETED');
  }

  canRefuse(order: Order): boolean {
    return canTransition(order.status, 'REFUSED');
  }

  transitionState(order: Order, targetState: OrderState, reason?: string): void {
    if (['CANCELLED', 'REFUSED'].includes(targetState) && !reason) {
      this.transitionTarget.set({ order, state: targetState });
      this.reasonText.set('');
      this.reasonModalVisible.set(true);
      return;
    }

    const actionMap: Record<OrderState, string> = {
      ACCEPTED: 'accept',
      REOPENED: 'reopen',
      COMPLETED: 'complete',
      CANCELLED: 'cancel',
      REFUSED: 'refuse',
      PENDING: 'reset to pending'
    };

    const action = actionMap[targetState] || targetState.toLowerCase();
    
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} order "${order.orderNumber}"?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Confirm', severity: 'primary' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.ordersApi.transitionOrderState(order.id, targetState, reason || 'State changed by user')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updated) => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: `Order state updated to ${targetState}.` });
              // Optimistic/Reactive Update
              this.orders.update(prev => 
                prev.map(o => o.id === updated.id ? updated : o)
              );
            },
            error: (err: unknown) => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
          });
      }
    });
  }

  submitReason(): void {
    const target = this.transitionTarget();
    if (!target || !this.reasonText().trim()) return;

    this.reasonSaving.set(true);
    this.ordersApi.transitionOrderState(
      target.order.id,
      target.state,
      this.reasonText().trim()
    ).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updated) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Order ${target.state.toLowerCase()} successfully.` });
        this.reasonModalVisible.set(false);
        // Optimistic/Reactive Update
        this.orders.update(prev => 
          prev.map(o => o.id === updated.id ? updated : o)
        );
        this.reasonSaving.set(false);
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unexpected error.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        this.reasonSaving.set(false);
      }
    });
  }

  openEditModal(order: Order): void {
    if (!this.canEdit(order)) {
      this.messageService.add({ severity: 'warn', summary: 'Edit Restricted', detail: `Order cannot be modified in "${order.status}" state.` });
      return;
    }
    this.modalMode.set('edit');
    this.editingId = order.id;
    this.draft.set({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      orderDate: new Date(order.orderDate)
    });
    this.draftItems.set([...(order.items || [])]);
    this.selectedProduct.set(null);
    this.selectedCustomer.set({ name: order.customerName } as Customer); // Mock selected customer for edit
    this.itemQuantity.set(1);
    this.itemPrice.set(0);
    this.modalVisible.set(true);
  }

  onModalHide(): void {
    this.modalSaving.set(false);
  }

  submitModal(): void {
    this.modalSaving.set(true);
    const currentDraft = this.draft();
    const customer = this.selectedCustomer();

    const input: OrderCreateInput = {
      orderNumber: currentDraft.orderNumber,
      customerName: customer?.name || currentDraft.customerName,
      totalAmount: currentDraft.totalAmount,
      orderDate: currentDraft.orderDate.toISOString(),
      items: this.draftItems()
    };

    const request = this.modalMode() === 'create'
      ? this.ordersApi.createOrder(input)
      : this.ordersApi.updateOrder(this.editingId!, input);

    request.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: `Order ${this.modalMode() === 'create' ? 'created' : 'updated'} successfully.` 
          });
          this.modalVisible.set(false);
          
          if (this.modalMode() === 'create') {
            const pageIndex = Math.floor(this.first() / this.pageSize());
            if (pageIndex === 0) {
              this.orders.update(current => {
                const next = [result, ...current];
                if (next.length > this.pageSize()) next.pop();
                return next;
              });
            }
            this.totalRecords.update(t => t + 1);
          } else {
            this.orders.update(current => 
              current.map(o => o.id === result.id ? result : o)
            );
          }
          this.modalSaving.set(false);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
          this.modalSaving.set(false);
        }
      });
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  // --- Order Items Logic ---
  
  searchProducts(event: any): void {
    this.isProductLoading.set(true);
    this.productsApi.searchProducts(event.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.isProductLoading.set(false);
        },
        error: (err) => {
          console.error('Error searching products:', err);
          this.products.set([]);
          this.isProductLoading.set(false);
        }
      });
  }

  searchCustomers(event: any): void {
    this.isCustomerLoading.set(true);
    this.customersApi.searchCustomers(customerSearchListRequest, event.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customers) => {
          this.customers.set(customers);
          this.isCustomerLoading.set(false);
        },
        error: (err) => {
          console.error('Error searching customers:', err);
          this.customers.set([]);
          this.isCustomerLoading.set(false);
        }
      });
  }

  onCustomerSelect(event: any): void {
    const customer = event?.value || event;
    this.selectedCustomer.set(customer);
    this.draft.update(d => ({ ...d, customerName: customer.name }));
  }

  clearCustomerSelection(): void {
    this.selectedCustomer.set(null);
    this.draft.update(d => ({ ...d, customerName: '' }));
  }

  onProductSelect(event: any): void {
    // If event has a .value (standard PrimeNG), use it, otherwise use event itself
    const product = event?.value || event;
    this.selectedProduct.set(product);
    this.itemQuantity.set(1);
    this.itemPrice.set(product.price);
  }

  clearProductSelection(): void {
    this.selectedProduct.set(null);
    this.itemQuantity.set(1);
    this.itemPrice.set(0);
  }

  addItem(): void {
    const product = this.selectedProduct();
    if (!product) {
      this.messageService.add({ severity: 'warn', summary: 'No Product Selected', detail: 'Please selection a product from the list.' });
      return;
    }

    let quantity = this.itemQuantity();
    if (!quantity || quantity <= 0) {
      quantity = 1;
      this.itemQuantity.set(1);
    }

    this.draftItems.update(items => {
      const existingIndex = items.findIndex(i => i.productId === product.id);
      if (existingIndex > -1) {
        const newItems = [...items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        };
        return newItems;
      } else {
        return [...items, {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          price: this.itemPrice()
        }];
      }
    });

    this.selectedProduct.set(null);
    this.itemQuantity.set(1);
    this.calculateTotal();
  }

  removeItem(index: number): void {
    this.draftItems.update(items => items.filter((_, i) => i !== index));
    this.calculateTotal();
  }

  updateQuantity(index: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(index);
    } else {
      this.draftItems.update(items => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], quantity };
        return newItems;
      });
      this.calculateTotal();
    }
  }

  protected calculateTotal(): void {
    const total = this.draftItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.draft.update(d => ({ ...d, totalAmount: total }));
  }

  deleteOrder(order: Order): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete order "${order.orderNumber}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.ordersApi.deleteOrder(order.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order deleted successfully.' });
              this.orders.update(current => current.filter(o => o.id !== order.id));
              this.totalRecords.update(t => t - 1);

              if (this.orders().length === 0 && this.first() > 0) {
                const pageIndex = Math.floor(this.first() / this.pageSize());
                void this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { page: pageIndex },
                  queryParamsHandling: 'merge',
                });
              }
            },
            error: (err: unknown) => {
              const message = err instanceof Error ? err.message : 'Unexpected error.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            }
          });
      }
    });
  }

  onPageChange(event: any): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(first / Math.max(rows, 1));
    
    if (this.first() !== first || this.pageSize() !== rows) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { 
          page: newPageIndex + 1,
          pageSize: rows
        },
        queryParamsHandling: 'merge',
      });

      if (this.first() !== first) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
}
