// HTTP infrastructure
export { apiResponseInterceptor } from './http/api-response.interceptor';
export { API_BASE_URL, provideApiBaseUrl, normalizeApiBaseUrl } from './http/api-base-url';
export type { ApiResponse } from './models/api-response';

// Error handling
export { formatApiError } from './http/api-error.format';
export { normalizeApiError, normalizeApiResponseFailure } from './http/api-error.normalize';
export { presentApiError } from './http/api-error.presenter';
export type { ApiErrorPresentation, ApiErrorRouteTarget } from './http/api-error.presenter';
export { ApiHttpError, ApiEmptyResponseError } from './http/api-http-error';
export type { ApiNormalizedError, ValidationErrors } from './http/api-http-error';

// Domain models
export type { Entity } from './models/entity';
export type { Paging, PagingInfo } from './models/paging';
export { EMPTY_PAGING_INFO } from './models/paging';

// Services
export { NavigationLoadingService } from './router/navigation-loading.service';
export { ThemeService } from './theme/theme.service';

// Module registration
export type {
  ModuleManifest,
  ModuleNavItem,
  ModuleNavGroup,
  ModuleNavEntry,
} from './module-manifest';
