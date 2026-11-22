import type { ApiNormalizedError } from '../http/api-http-error';

export interface ApiResponse<T> {
  result?: T;
  isSuccess: boolean;
  error?: ApiNormalizedError;
}
