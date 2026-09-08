import { PagedItemsState, PageRefreshOptions } from '@/components';

export * from './storage';

export interface FetchOption<
  TSearch,
  TParams = never,
> extends PageRefreshOptions {
  search?: (search: TSearch | undefined) => TSearch | undefined;
  params?: (search: TParams | undefined) => TParams | undefined;
}

export type Fetch<TSearch, TParams = never> = (
  options?: FetchOption<TSearch, TParams>,
) => Promise<void>;

export interface FetchState<
  TItem,
  TSearch,
  TParams = never,
> extends PagedItemsState<TItem> {
  search?: TSearch;
  params?: TParams;
  fetch: Fetch<TSearch, TParams>;
}
