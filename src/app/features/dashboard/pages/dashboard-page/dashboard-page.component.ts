import { Component } from '@angular/core';

import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { QuickActionsComponent } from '../../components/quick-actions/quick-actions.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [KpiCardComponent, QuickActionsComponent, SurfaceCardComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {}

