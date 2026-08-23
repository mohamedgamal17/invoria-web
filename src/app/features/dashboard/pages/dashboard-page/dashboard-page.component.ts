import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { ReportChartComponent } from '../../components/report-chart/report-chart.component';

import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { OrdersApiService } from '../../../orders/services/orders-api.service';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import { PurchaseOrdersApiService } from '../../../procurement/services/purchase-orders-api.service';

import {
  ClipboardCheck,
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  Warehouse
} from 'lucide-angular';

import {
  REPORT_PERIOD_LABELS,
  REPORT_SERIES_PERIODS,
  ReportPeriod
} from '../../../../shared/models/report-period';
import type { ReportOverview } from '../../../../shared/models/report-overview';
import type { CustomerCreationReportPeriod } from '../../../customers/models/customer-report.entity';
import type { ProductCreationReportPeriod } from '../../../products/models/product-report.entity';
import type {
  OrderCompletionReportPeriod,
  OrderSalesProfitReportPeriod,
  OrderSalesReportPeriod
} from '../../../orders/models/order-report.entity';
import type { SupplierCreationReportPeriod } from '../../../suppliers/models/supplier-report.entity';
import type { PurchaseSalesReportPeriod } from '../../../procurement/models/purchase-order-report.entity';
import type { EChartsCoreOption } from 'echarts/core';
import { presentApiError } from '../../../../core/http/api-error.presenter';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    FormsModule,
    KpiCardComponent,
    ReportChartComponent,
    ToastModule,
    SkeletonModule,
    SelectModule,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  private readonly customersApi = inject(CustomersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);

  readonly ReportPeriod = ReportPeriod;
  readonly periodOptions = REPORT_SERIES_PERIODS.map((v) => ({
    label: REPORT_PERIOD_LABELS[v],
    value: v
  }));

  // Icons for modern KPI cards
  readonly customersIcon = Users;
  readonly productsIcon = Package;
  readonly suppliersIcon = Warehouse;
  readonly completedOrdersIcon = ClipboardCheck;
  readonly orderSalesIcon = DollarSign;
  readonly profitIcon = TrendingUp;
  readonly purchaseSalesIcon = Receipt;
  readonly revenueIcon = Wallet;

  readonly selectedPeriod = signal<ReportPeriod>(ReportPeriod.Daily);

  readonly isOverviewLoading = signal(true);
  readonly isMetricsLoading = signal(true);
  readonly hasOverviewError = signal(false);

  // Overviews
  readonly customerOverview = signal<ReportOverview<CustomerCreationReportPeriod> | null>(null);
  readonly productOverview = signal<ReportOverview<ProductCreationReportPeriod> | null>(null);
  readonly supplierOverview = signal<ReportOverview<SupplierCreationReportPeriod> | null>(null);
  readonly orderSalesOverview = signal<ReportOverview<OrderSalesReportPeriod> | null>(null);
  readonly orderProfitOverview = signal<ReportOverview<OrderSalesProfitReportPeriod> | null>(null);
  readonly orderCompletionOverview = signal<ReportOverview<OrderCompletionReportPeriod> | null>(null);
  readonly purchaseSalesOverview = signal<ReportOverview<PurchaseSalesReportPeriod> | null>(null);

  // Metrics series (most recent first from API, we reverse for chronological)
  readonly salesProfitSeries = signal<OrderSalesProfitReportPeriod[]>([]);
  readonly salesSeries = signal<OrderSalesReportPeriod[]>([]);
  readonly customerSeries = signal<CustomerCreationReportPeriod[]>([]);
  readonly productSeries = signal<ProductCreationReportPeriod[]>([]);
  readonly supplierSeries = signal<SupplierCreationReportPeriod[]>([]);

  // KPI helpers
  kpiCustomersAll = computed(() => this.customerOverview()?.allTime.totalCount ?? null);
  kpiProductsAll = computed(() => this.productOverview()?.allTime.totalCount ?? null);
  kpiSuppliersAll = computed(() => this.supplierOverview()?.allTime.totalCount ?? null);
  kpiOrdersCompletedAll = computed(() => this.orderCompletionOverview()?.allTime.totalCount ?? null);
  kpiSalesAmountAll = computed(() => this.orderSalesOverview()?.allTime.totalAmount ?? null);
  kpiProfitAll = computed(() => this.orderProfitOverview()?.allTime.totalProfit ?? null);
  kpiPurchaseAmountAll = computed(() => this.purchaseSalesOverview()?.allTime.totalAmount ?? null);
  kpiRevenueAll = computed(() => this.orderProfitOverview()?.allTime.totalRevenue ?? null);

  // ECharts options
  readonly profitChartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.salesProfitSeries();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const labels = chronological.map((d) => this.formatDateLabel(d.date));
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Revenue', 'Cost', 'Profit'], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 16, right: 16, top: 24, bottom: 32, containLabel: true },
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { width: 2 },
          data: chronological.map((d) => d.totalRevenue)
        },
        {
          name: 'Cost',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.08 },
          lineStyle: { width: 2 },
          data: chronological.map((d) => d.totalCost)
        },
        {
          name: 'Profit',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.18 },
          lineStyle: { width: 2.5 },
          emphasis: { focus: 'series' },
          data: chronological.map((d) => d.totalProfit)
        }
      ],
      color: ['#6366f1', '#f59e0b', '#10b981']
    };
  });

  readonly salesChartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.salesSeries();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const labels = chronological.map((d) => this.formatDateLabel(d.date));
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
      xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10, rotate: 18 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Sales',
          type: 'bar',
          barMaxWidth: 28,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: chronological.map((d) => d.totalAmount)
        },
        {
          name: 'Returns',
          type: 'bar',
          barMaxWidth: 28,
          itemStyle: { borderRadius: [6, 6, 0, 0], opacity: 0.55 },
          data: chronological.map((d) => d.totalReturnAmount)
        }
      ],
      color: ['#0ea5e9', '#f43f5e']
    };
  });

  readonly customerChartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.customerSeries();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const labels = chronological.map((d) => this.formatDateLabel(d.date));
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Customers',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.2 },
          data: chronological.map((d) => d.totalCount)
        }
      ],
      color: ['#8b5cf6']
    };
  });

  readonly productChartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.productSeries();
    if (!data.length) return null;
    const chronological = [...data].reverse();
    const labels = chronological.map((d) => this.formatDateLabel(d.date));
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
      xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
      series: [
        {
          name: 'Products',
          type: 'bar',
          barMaxWidth: 22,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: chronological.map((d) => d.totalCount)
        }
      ],
      color: ['#06b6d4']
    };
  });

  ngOnInit(): void {
    this.loadOverviews();
    this.loadMetrics(this.selectedPeriod());
  }

  onPeriodChange(period: ReportPeriod): void {
    this.selectedPeriod.set(period);
    this.loadMetrics(period);
  }

  refresh(): void {
    this.loadOverviews();
    this.loadMetrics(this.selectedPeriod());
  }

  formatCurrency(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  formatNumber(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat().format(value);
  }

  private formatDateLabel(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    const period = this.selectedPeriod();
    if (period === ReportPeriod.Monthly) {
      return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
    if (period === ReportPeriod.Yearly) {
      return d.getFullYear().toString();
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  private loadOverviews(): void {
    this.isOverviewLoading.set(true);
    this.hasOverviewError.set(false);

    forkJoin({
      customers: this.customersApi.getCustomerCreationReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); })),
      products: this.productsApi.getProductCreationReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); })),
      suppliers: this.suppliersApi.getSupplierCreationReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); })),
      orderSales: this.ordersApi.getOrderSalesReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); })),
      orderProfit: this.ordersApi.getOrderSalesProfitReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); })),
      orderCompletion: this.ordersApi.getOrderCompletionReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); })),
      purchaseSales: this.purchaseOrdersApi.getPurchaseSalesReportOverview().pipe(catchError((e) => { this.handleError(e); return of(null); }))
    }).subscribe({
      next: (res) => {
        if (res.customers?.isSuccess && res.customers.result) this.customerOverview.set(res.customers.result);
        if (res.products?.isSuccess && res.products.result) this.productOverview.set(res.products.result);
        if (res.suppliers?.isSuccess && res.suppliers.result) this.supplierOverview.set(res.suppliers.result);
        if (res.orderSales?.isSuccess && res.orderSales.result) this.orderSalesOverview.set(res.orderSales.result);
        if (res.orderProfit?.isSuccess && res.orderProfit.result) this.orderProfitOverview.set(res.orderProfit.result);
        if (res.orderCompletion?.isSuccess && res.orderCompletion.result) this.orderCompletionOverview.set(res.orderCompletion.result);
        if (res.purchaseSales?.isSuccess && res.purchaseSales.result) this.purchaseSalesOverview.set(res.purchaseSales.result);
        this.isOverviewLoading.set(false);
      },
      error: (err) => {
        this.handleError(err);
        this.isOverviewLoading.set(false);
        this.hasOverviewError.set(true);
      }
    });
  }

  private loadMetrics(period: ReportPeriod): void {
    this.isMetricsLoading.set(true);
    const req = { Period: period, Skip: 0, Length: 14 } as const;

    forkJoin({
      profit: this.ordersApi.listOrderSalesProfitReportMetrics(req).pipe(catchError((e) => { this.handleError(e); return of(null); })),
      sales: this.ordersApi.listOrderSalesReportMetrics(req).pipe(catchError((e) => { this.handleError(e); return of(null); })),
      customers: this.customersApi.listCustomerCreationReportMetrics(req).pipe(catchError((e) => { this.handleError(e); return of(null); })),
      products: this.productsApi.listProductCreationReportMetrics(req).pipe(catchError((e) => { this.handleError(e); return of(null); })),
      suppliers: this.suppliersApi.listSupplierCreationReportMetrics(req).pipe(catchError((e) => { this.handleError(e); return of(null); }))
    }).subscribe({
      next: (res) => {
        if (res.profit?.isSuccess && res.profit.result) this.salesProfitSeries.set(res.profit.result.data ?? []);
        if (res.sales?.isSuccess && res.sales.result) this.salesSeries.set(res.sales.result.data ?? []);
        if (res.customers?.isSuccess && res.customers.result) this.customerSeries.set(res.customers.result.data ?? []);
        if (res.products?.isSuccess && res.products.result) this.productSeries.set(res.products.result.data ?? []);
        if (res.suppliers?.isSuccess && res.suppliers.result) this.supplierSeries.set(res.suppliers.result.data ?? []);
        this.isMetricsLoading.set(false);
      },
      error: (err) => {
        this.handleError(err);
        this.isMetricsLoading.set(false);
      }
    });
  }

  private handleError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
  }
}
