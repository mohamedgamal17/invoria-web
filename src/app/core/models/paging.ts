export interface PagingInfo {
  length: number;
  skip: number;
  totalCount: number;
}

export interface Paging<T> {
  data: T[];
  info: PagingInfo;
}
