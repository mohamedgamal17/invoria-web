import { createAction, props } from '@ngrx/store';

/**
 * Global presentation channel for any failed API interaction.
 * Feature effects dispatch it next to their own failure actions; a single
 * root-level effect consumes it (toast + error-route navigation) so no
 * feature ever owns error presentation.
 */
export const APP_ERROR_ACTIONS = {
  apiError: createAction('[App] Api Error', props<{ error: unknown }>()),
} as const;
