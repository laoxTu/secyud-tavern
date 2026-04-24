// components/pager/index.ts
import { useState, useCallback, useRef } from 'react';
import type { PageOptions, PagedResult } from '@/src/models/common';

interface UsePageOptions<T, S = string> {
    defaultPageSize?: number;
    defaultSearch?: S;
    fetcher: (params: PageOptions<S>) => Promise<PagedResult<T>>;
}

export function usePager<T, S = string>(options: UsePageOptions<T, S>) {
    const { defaultPageSize = 20, defaultSearch, fetcher } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState<S | undefined>(defaultSearch);
    const [error, setError] = useState<Error | null>(null);

    // 使用 ref 防重复请求
    const loadingRef = useRef(false);

    // 核心请求逻辑（不依赖 state，避免闭包问题）
    const executeFetch = useCallback(async (params: PageOptions<S>) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await fetcher(params);
            setData(result.data);
            setTotalCount(result.totalCount);
            setPageIndex(params.page ?? 0);
            setPageSize(params.pageSize ?? defaultPageSize);
            if (params.search !== undefined) setSearch(params.search);
            return result;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [fetcher, defaultPageSize]);

    // 触发请求
    const refresh = useCallback(async (params?: Partial<PageOptions<S>>) => {
        const finalParams: PageOptions<S> = {
            page: params?.page ?? pageIndex,
            pageSize: params?.pageSize ?? pageSize,
            search: params?.search ?? search,
        };
        return executeFetch(finalParams);
    }, [executeFetch, pageIndex, pageSize, search]);

    // 翻页
    const changePageIndex = useCallback((targetPage: number) => {
        void refresh({ page: targetPage });
    }, [refresh]);

    // 修改每页条数
    const changePageSize = useCallback((size: number) => {
        void refresh({ page: 0, pageSize: size });
    }, [refresh]);

    // 搜索
    const doSearch = useCallback((searchValue: S) => {
        void refresh({ page: 0, search: searchValue });
    }, [refresh]);

    return {
        data,
        loading,
        error,
        pageIndex,
        pageSize,
        totalCount,
        search,
        refresh,
        changePageIndex,
        changePageSize,
        doSearch,
        pageCount: Math.ceil(totalCount / pageSize),
    };
}