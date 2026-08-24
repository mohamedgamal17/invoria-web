# Report Page Rules — Invoria Web

> Canonical checklist for creating any `reports/<feat>` page (Sales/Profit are the reference). Complements `ARCHITECTURE.md`, `component-design-rules.md`, and `charts.md`. Treat as preference for agents.

## 1) Reference Scaffold
Duplicate `order-sales-report-page` (or `order-profit-report-page` — identical scaffolds, differ only in entity/KPI semantics/chart type).

## 2) Required Files
```
features/<domain>/models/<feat>-report.entity.ts                // {date, total*, period: ReportPeriod} — extend ReportOverview<T>
features/<domain>/models/list-<feat>-report.request.ts          // {Period: ReportPeriod} & PagingQueryRequest {Skip,Length}
features/<domain>/services/<domain>-api.service.ts              // get<Feat>ReportOverview() + list<Feat>ReportMetrics(req) — Observable<ApiResponse<...>>
features/<domain>/pages/order-<feat>-report-page/               // .ts + .html (smart page) — source of truth
features/<domain>/pages/order-<feat>-metrics-page/              // table page — rxResource + URL queryParams (period/page/pageSize)
features/<domain>/components/<feat>-metrics-filter-panel|list/  // presentational filter/table for metrics page
shared/ui/chart-card/chart-card.component.ts|html               // canonical ECharts wrapper (use this, not report-chart except on dashboard)
shared/ui/page-header/page-header.component.ts                  // no controls projection for reports
features/dashboard/components/kpi-card/kpi-card.component.ts    // KPI display
```

## 3) Models & Constants
- `shared/models/report-period.ts`: `enum ReportPeriod { Daily=5, Monthly=10, Yearly=15, AllTime=20 }`, `REPORT_PERIOD_LABELS`, `REPORT_SERIES_PERIODS = [Daily, Monthly, Yearly]`
- `shared/models/report-overview.ts`: `interface ReportOverview<T> { thisDay, thisMonth, thisYear, allTime: T }`
- `shared/charts/echarts-presets.ts`: `ECHARTS_PALETTE`, `ECHARTS_GRID_COMPACT`, `formatPeriodLabel(iso, period)` — use for all period labels
- `shared/requests/paging-query.request.ts`: `{Skip,Length}`

## 4) Component Contract (TS)

```ts
@Component({
  selector: 'app-order-<feat>-report-page',
  standalone: true,
  imports: [ToastModule, SkeletonModule, ButtonModule, ChartCardComponent, PageHeaderComponent, KpiCardComponent],
  providers: [MessageService],
  templateUrl: './...html'
})
export class Order<Feat>ReportPageComponent implements OnInit {
  private readonly api = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly periodOptions = REPORT_SERIES_PERIODS.map(v => ({ label: REPORT_PERIOD_LABELS[v], value: v }));
  readonly selectedPeriod = signal<ReportPeriod>(ReportPeriod.Daily);
  readonly isOverviewLoading = signal(true);
  // Per-period cache — success only (matches productSearchCache precedent)
  private readonly metricsCache = signal<Map<ReportPeriod, Dto[]>>(new Map());
  private readonly metricsLoadingSet = signal<Set<ReportPeriod>>(new Set());
  readonly isMetricsLoading = computed(() => this.metricsLoadingSet().has(this.selectedPeriod()));
  readonly overview = signal<ReportOverview<Dto> | null>(null);
  readonly series = computed<Dto[]>(() => this.metricsCache().get(this.selectedPeriod()) ?? []);
  // KPIs derived from overview().allTime
  readonly kpiAllTime* = computed(() => this.overview()?.allTime.total* ?? null);
  readonly chartOptions = computed<EChartsCoreOption | null>(() => {
    const data = this.series(); if (!data.length) return null;
    const chronological = [...data].reverse(); // API returns most-recent first
    const labels = chronological.map(d => formatPeriodLabel(d.date, this.selectedPeriod()));
    return { tooltip:{trigger:'axis'}, legend:{data:[...], bottom:0}, grid:{left:16,right:16,top:16,bottom:36,containLabel:true},
             xAxis:{type:'category', data:labels}, yAxis:{type:'value'}, series:[...], color:[ECHARTS_PALETTE.*] };
  });

  ngOnInit(){ this.loadOverview(); this.ensureMetrics(this.selectedPeriod()); }
  onPeriodChange(p:ReportPeriod){ if(this.selectedPeriod()===p && this.metricsCache().has(p)) return; this.selectedPeriod.set(p); this.ensureMetrics(p); }
  refresh(){ this.loadOverview(); this.metricsCache.update(m=>{ const n=new Map(m); n.delete(this.selectedPeriod()); return n;}); this.ensureMetrics(this.selectedPeriod()); }
  goToMetrics(){ void this.router.navigate(['metrics'], { relativeTo:this.route, queryParams:{period:this.selectedPeriod()}, queryParamsHandling:'merge'}); }

  private ensureMetrics(period:ReportPeriod){
    if(this.metricsCache.has(period)||this.metricsLoadingSet.has(period)) return;
    this.metricsLoadingSet.update(s=>new Set(s).add(period));
    const req={Period:period, Skip:0, Length:14} as const;
    this.api.list<Feat>ReportMetrics(req).pipe(catchError(e=>{ this.handleError(e); return of(null)}))
      .subscribe({ next:res=>{ if(res?.isSuccess&&res.result){ const copy=[...(res.result.data??[])]; this.metricsCache.update(m=>new Map(m).set(period,copy)); } else if(res&&!res.isSuccess) this.handleError(res.error); /* do not cache error */ this.metricsLoadingSet.update(s=>{const n=new Set(s); n.delete(period); return n;})},
                 error:err=>{ this.handleError(err); this.metricsLoadingSet.update(s=>{const n=new Set(s); n.delete(period); return n;})}});
  }
  private handleError(e:unknown){ const p=presentApiError(e); this.messageService.add(p.toast); if(p.routeTarget) void this.router.navigate([p.routeTarget]); }
  formatCurrency(v:number|null){ if(v==null) return '—'; return new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v); }
  formatNumber(v:number|null){ if(v==null) return '—'; return new Intl.NumberFormat().format(v); }
}
```

Rules: `Length:14` fixed; cache only on `isSuccess && result`; never cache error; swallow duplicate in-flight with `metricsLoadingSet`.

## 5) HTML Order & Classes

```html
<p-toast/>
<section class="space-y-8">
  <app-page-header title="X report" description="… Daily / Monthly / Yearly aggregation." eyebrow="Ordering · Reports" eyebrowIcon="pi pi-chart-bar|pi pi-chart-line" class="block" />
  <!-- Overview KPIs -->
  <section class="space-y-5">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      <!-- 4× app-kpi-card [value]="kpi()!=null?formatCurrency(): '—'" [hint]="overview()? … " tone=primary|success|danger|warning [loading]=isOverviewLoading [icon]=* -->
    </div>
  </section>
  <!-- Hints trio as KPI cards with temporal icons -->
  <section class="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
    <!-- 3× app-kpi-card title="Today|This month|This year" [value]="overview()?.thisDay|Month|Year.* ? formatCurrency(): '—'" [hint]="Gross·Returns / Revenue·Cost" tone=success|primary|warning [loading]=isOverviewLoading [icon]=todayIcon|monthIcon|yearIcon (Calendar|CalendarRange|Clock) -->
  </section>
  <app-chart-card title="…" subtitle="Aggregation: +periodOptions.find(p=>p.value===selectedPeriod())!.label+' · Last 14 periods'" [options]=chartOptions [loading]=isMetricsLoading heightClass="h-[24rem]" [showPeriodSelector]=true [selectedPeriod]=selectedPeriod [periodOptions]=periodOptions (periodChange)=onPeriodChange>
    <p-button label="View full metrics table" icon="pi pi-table" severity="secondary" [outlined]="true" (onClick)=goToMetrics />
  </app-chart-card>
</section>
```

- Outer `space-y-8` (32px) between header/KPI/hints/chart. KPI wrappers `space-y-5`, grids `gap-5 sm:gap-6`.
- `KpiCard` chrome `rounded-2xl border p-5 shadow-sm`, icon `h-14 w-14 rounded-2xl` tone classes.
- `PageHeader` `invoria-gradient-surface rounded-2xl border border-border/80 px-5 py-6 sm:px-6 sm:py-7 gap-4 sm:gap-6`.

## 6) ChartCard Contract

`shared/ui/chart-card` (`host:{class:'block w-full'}`):
`title!:string, subtitle?:string, options:EChartsCoreOption|null, loading:boolean, heightClass='h-72'→override 'h-[24rem]', showPeriodSelector:boolean, selectedPeriod:ReportPeriod|null, periodOptions, periodChange:Output<ReportPeriod>, emptyText:string, emptyOptions:computed (tooltip hidden, grid 16/16/16/36, xAxis category data:[], yAxis value dashed #f1f5f9)`.

Template: header `rounded-xl border p-4` with `p-selectButton [allowEmpty]=false styleClass="text-sm"` + `<ng-content/>` for action + pulse dot; body `@if(loading){ div [class]='w-full '+heightClass() → p-skeleton h-full } @else { div echarts [options]="(options()??emptyOptions())!" }`.

Rules: compute `EChartsCoreOption` in page via `computed()`, type `EChartsCoreOption` never `any`, use `ECHARTS_PALETTE` + `formatPeriodLabel`, do not `import * as echarts`.

## 7) Routing & Sidebar

```ts
// features/orders/orders.routes.ts — reports BEFORE :id
{path:'reports/sales', loadComponent:()=>import('…sales-report-page')},
{path:'reports/sales/metrics', loadComponent:()=>import('…sales-metrics-page')},
{path:'reports/profit', loadComponent:()=>import('…profit-report-page')},
{path:'reports/profit/metrics', loadComponent:()=>import('…profit-metrics-page')},
```
```ts
// layout/dashboard-sidebar.component.ts Sales group
{label:'Sales', icon:TrendingUp, children:[
  {label:'Orders', path:'/orders', icon:ShoppingBag},
  {label:'Sales report', path:'/orders/reports/sales', icon:BarChart3},
  {label:'Sales metrics', path:'/orders/reports/sales/metrics', icon:Table2},
  {label:'Profit report', path:'/orders/reports/profit', icon:Wallet},
  {label:'Profit metrics', path:'/orders/reports/profit/metrics', icon:Table2},
]}
linkActiveOptions(_path:string):IsActiveMatchOptions{
  return {paths:'exact', queryParams:'ignored', matrixParams:'ignored', fragment:'ignored'};
} // prevents subset double-active (Orders vs reports, sales vs sales/metrics)
```

## 8) Sales vs Profit Diffs (copy the right one)

|  | Sales | Profit |
|--|-------|--------|
| Entity | `OrderSalesReportPeriod {totalAmount, totalNetAmount, totalReturnAmount}` | `OrderSalesProfitReportPeriod {totalRevenue, totalCost, totalProfit, totalReturnAmount}` |
| Top 4 KPIs | All-time gross/totalAmount, All-time net/totalNetAmount, All-time returns/totalReturnAmount, Today gross/thisDay.totalAmount | All-time profit/totalProfit, revenue/totalRevenue, cost/totalCost, returns/totalReturnAmount |
| Hints value | `thisDay|Month|Year.totalNetAmount` hint `Gross·Returns` | `totalProfit` hint `Revenue·Cost` |
| Chart | Bar 3× `barMaxWidth28 radius[6,6,0,0]` Gross/Net(0.85)/Returns(0.55) `color info/success/danger` boundaryGap true rotate18 | Line smooth area Revenue 0.15 / Cost 0.08 / Profit 0.18 width2.5 `color primary/warning/success` boundaryGap false |
| API | `getOrderSalesReportOverview` + `listOrderSalesReportMetrics` | `getOrderSalesProfitReportOverview` + `listOrderSalesProfitReportMetrics` |

## 9) Metrics Page & Filter Panels

Metrics table pages use `rxResource` + `toSignal(route.queryParamMap)` for `period/page/pageSize`, `linkedSignal` for display, `router.navigate([],{queryParams, queryParamsHandling:'merge'})` on page/filter change. Filter panel is presentational `input()/output()` with `p-select` for `periodOptions`; list component is dumb `input(loading, rows, totalRecords) / output(pageChange)`.

## 10) Anti-Patterns

- Do not project `p-select`/`Refresh` into `app-page-header` — use `chart-card` header.
- Do not `paths:'subset'` for reports (use `exact`).
- Do not cache error/empty (retry must refetch).
- Do not hardcode hex colors — use `ECHARTS_PALETTE`/`ECHARTS_GRID_COMPACT`.
- Do not register `provideEchartsCore` outside `app.config.ts`.

## 11) Quick Start (new Completion report)

1. Add `order-completion-report.entity.ts` + `list-order-completion.request.ts`
2. Add `getOrderCompletionReportOverview` + `listOrderCompletionReportMetrics` to `OrdersApiService`
3. Duplicate `order-sales-report-page` → `order-completion-report-page` (keep cache/signals, swap entity/chart type)
4. Add `reports/completion` + `reports/completion/metrics` routes before `:id`
5. Add sidebar entries `Completion report` (`BarChart3`) + `Completion metrics` (`Table2`) under Sales
6. Create metrics page + filter/list (reuse sales-metrics scaffold with `ReportPeriod` param)

Deviation breaks caching, exact active, empty diagram, or design parity.
