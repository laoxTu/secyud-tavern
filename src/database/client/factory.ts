import { DataRequest, DataResponse } from '@/database';
import { FetchOption, FetchState } from '@/database/client';

export const states = {
  createFetch: <TItem, TSearch, TParams = never>(
    set: (partial: Partial<FetchState<TItem, TSearch, TParams>>) => void,
    get: () => FetchState<TItem, TSearch, TParams>,
    fetcher: (
      request?: DataRequest<TSearch>,
      params?: TParams,
    ) => Promise<DataResponse<TItem>>,
  ) => {
    async function fetch(options?: FetchOption<TSearch, TParams>) {
      try {
        if (options) {
          const { search, params, page, size } = options;
          const currentState = get();
          set({
            cur: page ?? currentState.cur,
            size: size ?? currentState.size,
            search: search ? search(currentState.search) : currentState.search,
            params: params ? params(currentState.params) : currentState.params,
            loading: true,
          });
        } else {
          set({ loading: true });
        }

        const { search, size, cur, params } = get();
        let response = await fetcher(
          {
            search,
            size,
            skip: cur * size,
          },
          params,
        );

        const max = Math.ceil(response.length / size);
        if (cur >= max && max > 0) {
          set({ cur: max - 1 });
          response = await fetcher(
            {
              search: search,
              size: size,
              skip: (max - 1) * size,
            },
            params,
          );
        }

        set({
          items: response.items,
          max: max,
        });
      } catch (error) {
        throw error;
      } finally {
        set({
          loading: false,
        });
      }
    }

    return fetch;
  },
};
