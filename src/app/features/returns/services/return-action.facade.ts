import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import type { ApiResponse } from '../../../core/models/api-response';
import type { Return } from '../models/return.entity';
import { ReturnsApiService } from './returns-api.service';
import type { ReturnActionKey } from '../models/return-actions';
import { RETURN_ACTION_UI } from '../models/return-actions';

export type ReturnTransitionAction = ReturnActionKey;

@Injectable({
  providedIn: 'root'
})
export class ReturnActionFacade {
  private readonly returnsApi = inject(ReturnsApiService);

  execute(
    action: ReturnTransitionAction,
    returnId: string
  ): Observable<ApiResponse<Return>> {
    switch (action) {
      case 'approve':
        return this.returnsApi.approveReturn(returnId);
      case 'reject':
        return this.returnsApi.rejectReturn(returnId);
      default:
        return throwError(() => new Error(`Unsupported return action: ${String(action)}`));
    }
  }

  meta(action: ReturnTransitionAction) {
    return RETURN_ACTION_UI[action];
  }
}
