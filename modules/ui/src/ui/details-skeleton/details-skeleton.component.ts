import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * 3-tile details skeleton loader shared across details pages.
 */
@Component({
  selector: 'app-details-skeleton',
  standalone: true,
  imports: [CardModule, SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './details-skeleton.component.html',
})
export class DetailsSkeletonComponent {}
