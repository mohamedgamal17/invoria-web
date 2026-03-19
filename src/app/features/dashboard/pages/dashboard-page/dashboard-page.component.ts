import { Component } from '@angular/core';

import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { LowStockWidgetComponent } from '../../components/low-stock-widget/low-stock-widget.component';
import { QuickActionsComponent } from '../../components/quick-actions/quick-actions.component';
import { RecentActivityComponent } from '../../components/recent-activity/recent-activity.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    KpiCardComponent,
    LowStockWidgetComponent,
    QuickActionsComponent,
    RecentActivityComponent
  ],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {}

