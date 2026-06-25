'use client';
import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {useTranslations} from "next-intl";
import {PagedResult, PageOptions} from "@/business/models";
import {UseStoreState} from "@/business/client/models";
import {create} from "zustand";

export interface PagedItemsState<T> {
    items?: T[],
    curPage: number,
    maxPage: number,
    loading: boolean,
    pageSize: number,
    search: any,
    params: any,
    fetch: (params?: Partial<PageOptions> | any) => Promise<void>,
}

export function createUsePagedItemsState<T>(
    fetcher: (params: any) => Promise<PagedResult<T>>, pageSize: number = 5) {
    const func =
        (set: (partial: Partial<PagedItemsState<T>>) => void, get: () => PagedItemsState<T>)
            : PagedItemsState<T> => ({
            curPage: 0,
            maxPage: 0,
            loading: false,
            pageSize: pageSize,
            search: undefined,
            params: {},
            async fetch(params) {
                try {
                    if (params) {
                        const currentState = get();
                        const mergedParams = {
                            curPage: params.page ?? currentState.curPage,
                            pageSize: params.pageSize ?? currentState.pageSize,
                            search: params.search ?? currentState.search,
                            params: {...currentState.params, ...(params.params ?? {})}
                        };
                        set({
                            ...mergedParams,
                            loading: true,
                        });
                    }

                    const {search, pageSize, curPage, params: curParams} = get();
                    const res = await fetcher({
                        search: search,
                        pageSize: pageSize,
                        page: curPage,
                        ...curParams,
                    })
                    set({
                        items: res.data,
                        maxPage: Math.ceil(res.totalCount / pageSize),
                    });
                } catch (error) {
                    throw error;
                } finally {
                    set({
                        loading: false,
                    })
                }
            }
        });

    return create<PagedItemsState<T>>()(func);
}


export interface PaginationWrapperProps<T> {
    usePagedItemsState: UseStoreState<PagedItemsState<T>>
    /** 最多显示多少个页码按钮（奇数） */
    pageVisibleCount?: number;
    /** 是否显示跳转输入框 */
    pageInputVisible?: boolean;
    /** 自定义类名 */
    className?: string;
}

/**
 * 生成要显示的页码数组
 * @example generatePaginationRange(5, 10, 7) => [1, '...', 4, 5, 6, '...', 10]
 */
function generatePaginationRange(
    currentPage: number,
    totalPages: number,
    pageVisibleCount: number = 5
): number [] {
    // 确保参数是有效数字
    const current = Math.max(0, Math.min(currentPage, totalPages - 1));
    const total = Math.max(0, totalPages);
    const max = Math.max(3, Math.min(pageVisibleCount, total));

    // 显示所有页
    if (total <= max) {
        return Array.from({length: total}, (_, i) => i);
    }

    let startPage = current - Math.floor((max - 3) / 2);
    let endPage = startPage + max;

    // 调整边界
    if (startPage <= 0) {
        startPage = 0;
        endPage = max;
    }
    if (endPage >= total) {
        endPage = total;
        startPage = total - max;
    }

    const pages: number[] = [];

    pages.push(0);

    // 添加左侧省略号
    if (startPage > 0) {
        pages.push(-1);
    }

    // 添加中间的页码
    for (let i = startPage + 1; i < endPage - 1; i++) {
        pages.push(i);
    }

    // 添加右侧省略号
    if (endPage < total) {
        pages.push(-1);
    }

    if (total > 1)
        pages.push(total - 1);

    return pages;
}

/**
 * 封装好的分页组件
 * 包含页码显示、上一页/下一页、省略号、跳转输入框等功能
 */
export function PaginationWrapper<T>(
    {
        usePagedItemsState,
        pageVisibleCount,
        className = undefined,
    }: PaginationWrapperProps<T>) {
    const t = useTranslations();
    const {curPage, maxPage, fetch} = usePagedItemsState();

    const handlePageIndexChange = (page: number) => {
        if (page >= 0 && page < maxPage && page !== curPage) {
            fetch({page});
        }
    };

    const pages = generatePaginationRange(curPage, maxPage, pageVisibleCount);
    const isFirstPage = curPage === 0;
    const isLastPage = curPage === maxPage - 1;
    const pagerClass =
        (disabled: boolean) =>
            disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer';

    return (
        <Pagination className={className}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handlePageIndexChange(curPage - 1)}
                        className={pagerClass(isFirstPage)}
                        text={t("page.previous")}
                        aria-disabled={isFirstPage}
                    />
                </PaginationItem>

                {pages.map((page, index) => (
                    <PaginationItem key={index}>
                        {page === -1 ? (
                            <PaginationEllipsis/>
                        ) : (
                            <PaginationLink
                                onClick={() => handlePageIndexChange(page)}
                                isActive={curPage === page}
                                className="cursor-pointer"
                            >
                                {page + 1}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => handlePageIndexChange(curPage + 1)}
                        className={pagerClass(isLastPage)}
                        aria-disabled={isLastPage}
                        text={t("page.next")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}