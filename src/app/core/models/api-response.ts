export interface ApiResponse<T> {
  result?: T;
  isSuccess: boolean;
  error?: any;
}
