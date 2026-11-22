export interface PagingInfo {
  length: number;
  skip: number;
  totalCount: number;
}

export interface Paging<T> {
  data: T[];
  info: PagingInfo;
}

export const EMPTY_PAGING_INFO: PagingInfo = { length: 0, skip: 0, totalCount: 0 };
