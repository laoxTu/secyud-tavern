'use client';
import {useState, useCallback, useRef, useEffect} from 'react';
import type {PageOptions, PagedResult} from '@/business/models';
import {useErrorHandler} from "@/handler/client/error";

interface UsePageOptions<T> {
    defaultPageSize?: number;
    defaultSearch?: any;
    fetcher: (params: PageOptions) => Promise<PagedResult<T>>;
}

export {PaginationWrapper} from './component';

export function usePager<T>(options: UsePageOptions<T>) {
    const {handleError} = useErrorHandler();
    const {defaultPageSize = 10, defaultSearch, fetcher} = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState<any | undefined>(defaultSearch);
    const [error, setError] = useState<Error | null>(null);

    // 使用 ref 防重复请求
    const loadingRef = useRef(false);
    const hasRequestedRef = useRef(false);

    // 核心请求逻辑（不依赖 state，避免闭包问题）
    const executeFetch = useCallback(async (params: PageOptions) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await fetcher(params);
            setData(result.data);
            setSearch(params.search);
            setPageIndex(params.page ?? 0);
            setPageSize(params.pageSize ?? defaultPageSize);
            setTotalCount(result.totalCount);
        } catch (err) {
            setError(err as Error);
            handleError(err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [fetcher, defaultPageSize, handleError]);

    // 触发请求
    const refresh = useCallback(async (params?: Partial<PageOptions>) => {
        const finalParams: PageOptions = {
            page: params?.page ?? pageIndex,
            pageSize: params?.pageSize ?? pageSize,
            search: params?.search ?? search,
        };
        void executeFetch(finalParams);
    }, [executeFetch, pageIndex, pageSize, search]);

    // 翻页
    const changePageIndex = useCallback((targetPage: number) => {
        void refresh({page: targetPage});
    }, [refresh]);

    // 修改每页条数
    const changePageSize = useCallback((size: number) => {
        void refresh({page: 0, pageSize: size});
    }, [refresh]);

    // 搜索
    const doSearch = useCallback((searchValue: any | undefined) => {
        void refresh({page: 0, search: searchValue});
    }, [refresh]);

    useEffect(() => {
        if (!hasRequestedRef.current) {
            hasRequestedRef.current = true;
            void refresh({page: 0, pageSize: defaultPageSize, search: defaultSearch});
        }
    }, [refresh, defaultPageSize, defaultSearch]);

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