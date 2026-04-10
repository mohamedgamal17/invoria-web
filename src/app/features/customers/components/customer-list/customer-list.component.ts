import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';

import { CustomerListSkeletonComponent } from '../customer-list-skeleton/customer-list-skeleton.component';
import type { Customer } from '../../models/customer.entity';

@Component({
  selector: 'app-customer-list',
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
    CustomerListSkeletonComponent
  ],
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent {
  customers = input<Customer[]>([]);
  loading = input(false);
  totalRecords = input(0);
  pageIndex = input(0);
  pageSize = input(10);
  pageSizeOptions = input<number[]>([5, 10, 20]);

  pageChange = output<unknown>();
  editCustomer = output<Customer>();
  deleteCustomer = output<Customer>();
}
