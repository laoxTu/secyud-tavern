// components/ui/pagination-wrapper.tsx
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

export interface PaginationWrapperProps {
    /** 当前页码（从1开始） */
    defaultPageIndex: number;
    /** 总页数 */
    pageCount: number;
    /** 页码改变时的回调函数 */
    onPageIndexChanged: (page: number) => void;
    /** 最多显示多少个页码按钮（奇数） */
    visiblePageCount?: number;
    /** 是否显示跳转输入框 */
    showPageInput?: boolean;
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
    maxVisiblePages: number = 7
): (number | string)[] {
    // 确保参数是有效数字
    const current = Math.max(0, Math.min(currentPage, totalPages - 1));
    const total = Math.max(0, totalPages);
    const max = Math.max(3, Math.min(maxVisiblePages, total));

    // 如果总页数小于等于最大显示数，显示所有页码
    if (total <= max) {
        return Array.from({length: total}, (_, i) => i + 1);
    }

    const leftSibling = Math.floor((max - 3) / 2);
    const rightSibling = max - 3 - leftSibling;

    // 计算左右边界
    let startPage = current - leftSibling;
    let endPage = current + rightSibling;

    // 调整边界
    if (startPage <= 2) {
        startPage = 2;
        endPage = max - 2;
    }
    if (endPage >= total - 1) {
        endPage = total - 1;
        startPage = total - (max - 3);
    }

    const pages: (number | string)[] = [1];

    // 添加左侧省略号
    if (startPage > 2) {
        pages.push('...');
    }

    // 添加中间的页码
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // 添加右侧省略号
    if (endPage < total - 1) {
        pages.push('...');
    }

    // 添加最后一页
    pages.push(total);

    return pages;
}

/**
 * 封装好的分页组件
 * 包含页码显示、上一页/下一页、省略号、跳转输入框等功能
 */
export function PaginationWrapper({
                                      defaultPageIndex,
                                      pageCount,
                                      onPageIndexChanged,
                                      visiblePageCount = 7,
                                      className = '',
                                  }: PaginationWrapperProps) {
    const t = useTranslations();
    // 不需要分页的情况
    if (pageCount <= 1) {
        return null;
    }

    const pages = generatePaginationRange(defaultPageIndex, pageCount, visiblePageCount);
    const isFirstPage = defaultPageIndex === 0;
    const isLastPage = defaultPageIndex === pageCount - 1;

    const handlePageIndexChange = (page: number) => {
        if (page >= 0 && page < pageCount && page !== defaultPageIndex) {
            onPageIndexChanged(page);
        }
    };

    return (
        <Pagination className={className}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => handlePageIndexChange(defaultPageIndex - 1)}
                        className={
                            isFirstPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                        }
                        text={t("previous page")}
                        aria-disabled={isFirstPage}
                    />
                </PaginationItem>

                {pages.map((page, index) => (
                    <PaginationItem key={index}>
                        {page === '...' ? (
                            <PaginationEllipsis/>
                        ) : (
                            <PaginationLink
                                onClick={() => handlePageIndexChange(page as number)}
                                isActive={defaultPageIndex === page}
                                className="cursor-pointer"
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => handlePageIndexChange(defaultPageIndex + 1)}
                        className={
                            isLastPage
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                        }
                        aria-disabled={isLastPage}
                        text={t("next page")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}