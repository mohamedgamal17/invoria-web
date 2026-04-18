import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import type { PaginatorState } from 'primeng/paginator';
import { PaginatorModule } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { SupplierListSkeletonComponent } from '../supplier-list-skeleton/supplier-list-skeleton.component';
import type { Supplier } from '../../models/supplier.entity';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    SupplierListSkeletonComponent
  ],
  templateUrl: './supplier-list.component.html'
})
export class SupplierListComponent {
  suppliers = input.required<Supplier[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  nameFilter = input<string>('');
  pageSizeOptions = input<number[]>([5, 10, 20]);

  viewSupplier = output<Supplier>();
  pageChange = output<PaginatorState | TablePageEvent>();
  nameFilterChange = output<string>();
}
