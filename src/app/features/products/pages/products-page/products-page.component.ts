import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import type { PagingInfo } from '../../../../core/models/paging';
import { ProductHeaderComponent } from '../../components/product-header/product-header.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import {
  ProductsBreadcrumbComponent,
  type ProductsBreadcrumbItem
} from '../../components/products-breadcrumb/products-breadcrumb.component';

import { ProductsApiService } from '../../services/products-api.service';
import type { Product } from '../../models/product.entity';
import type { ListProductRequest } from '../../models/list-product.request';
import { formatApiError } from '../../../../core/http/api-error.format';

const EMPTY_PRODUCTS_TUPLE: [Product[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ProductHeaderComponent,
    ProductListComponent,
    ProductsBreadcrumbComponent
  ],
  templateUrl: './products-page.component.html'
})
export class ProductsPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly breadcrumbItems: ProductsBreadcrumbItem[] = [{ label: 'Products' }];

  /** 1-based page number from `?page=` (default 1). */
  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('page');
        const n = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(n) && n >= 1 ? n : 1;
      })
    ),
    { initialValue: 1 }
  );

  /** Page size from `?pageSize=` (must be in pageSizeOptions; default 25). */
  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('pageSize');
        const n = raw ? parseInt(raw, 10) : NaN;
        return this.pageSizeOptions.includes(n) ? n : 25;
      })
    ),
    { initialValue: 25 }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListProductRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize()
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly productsResource = rxResource<[Product[], PagingInfo], ListProductRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_PRODUCTS_TUPLE,
    stream: ({ params }) =>
      this.productsApi.listProducts(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            const detail = formatApiError(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return EMPTY_PRODUCTS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Product[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
          return of(EMPTY_PRODUCTS_TUPLE);
        })
      )
  });

  readonly displayProducts = linkedSignal({
    source: () => this.productsLinkSource(),
    computation: (src) => [...src.products]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.productsLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  navigateToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

  viewProduct(product: Product): void {
    void this.router.navigate([product.id], { relativeTo: this.route.parent });
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: newPageIndex + 1,
          pageSize: rows
        },
        queryParamsHandling: 'merge'
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  private productsLinkSource(): {
    request: ListProductRequest;
    products: Product[];
    paging: PagingInfo;
  } {
    const [products, paging] = this.productsResource.value();
    return {
      request: this.listRequest(),
      products,
      paging
    };
  }
}
