export type ValidationErrors = Record<string, string[]>;

export type ApiNormalizedError = {
  /** HTTP status code if known (0 for network/CORS). */
  status?: number;
  /** Short human title (e.g. "Validation failed"). */
  title: string;
  /** Longer description suitable for a toast. */
  detail?: string;
  /** Optional field-level errors. */
  validationErrors?: ValidationErrors;
  /** Original error payload, for debugging only. */
  raw?: unknown;
};

export class ApiHttpError extends Error {
  readonly normalized: ApiNormalizedError;

  constructor(normalized: ApiNormalizedError) {
    super(normalized.detail ?? normalized.title);
    this.name = 'ApiHttpError';
    this.normalized = normalized;
  }
}

export class ApiEmptyResponseError extends ApiHttpError {
  constructor(url?: string, status?: number) {
    super({
      status,
      title: 'Empty response from server',
      detail: url ? `The server returned an empty response for ${url}.` : 'The server returned an empty response.'
    });
    this.name = 'ApiEmptyResponseError';
  }
}

