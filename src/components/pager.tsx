'use client';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

import { cn } from '@/lib/utils';

import {
  EmptyEntries,
  Item,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
} from '.';

export interface PageRefreshOptions {
  size?: number;
  page?: number;
}

export interface PagedItemsState<TItem> {
  items?: TItem[];
  loading?: boolean;
  max: number;
  cur: number;
  size: number;
  refresh: (option?: PageRefreshOptions) => Promise<void>;
}

export interface PaginationWrapperProps<TItem> {
  usePager: () => PagedItemsState<TItem>;
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
  pageCur: number,
  pageMax: number,
  pageCnt: number = 5,
): number[] {
  // 确保参数是有效数字
  pageMax = Math.max(pageMax, 0);
  pageCur = Math.max(0, Math.min(pageMax - 1, pageCur));

  // 显示所有页
  if (pageMax <= pageCnt) {
    return Array.from({ length: pageMax }, (_, i) => i);
  }

  let startPage = Math.max(0, pageCur - Math.floor(pageCnt / 2));
  let endPage = startPage + pageCnt;

  // 调整边界
  if (startPage <= 0) {
    startPage = 0;
    endPage = pageCnt;
  }
  if (endPage >= pageMax) {
    endPage = pageMax;
    startPage = endPage - pageCnt;
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
  if (endPage < pageMax) {
    pages.push(-1);
  }

  if (pageMax > 1) pages.push(pageMax - 1);

  return pages;
}

/**
 * 封装好的分页组件
 * 包含页码显示、上一页/下一页、省略号、跳转输入框等功能
 */
export function PaginationWrapper<TItem>({
  usePager,
  pageVisibleCount,
  className = undefined,
}: PaginationWrapperProps<TItem>) {
  useTranslations();
  const { cur, max, refresh } = usePager();

  const changePage = (page: number) => {
    if (page >= 0 && page < max && page !== cur) {
      void refresh({ page });
    }
  };

  const pages = generatePaginationRange(cur, max, pageVisibleCount);
  const isFirstPage = cur === 0;
  const isLastPage = cur === max - 1;
  const pagerClass = (disabled: boolean) =>
    disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer';

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => changePage(cur - 1)}
            className={pagerClass(isFirstPage)}
            aria-disabled={isFirstPage}
            text={''}
          />
        </PaginationItem>

        {pages.map((page, index) => (
          <PaginationItem key={index}>
            {page === -1 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => changePage(page)}
                isActive={cur === page}
                className="cursor-pointer"
              >
                {page + 1}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => changePage(cur + 1)}
            className={pagerClass(isLastPage)}
            aria-disabled={isLastPage}
            text={''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

interface PagedItemListProps<TItem> extends PaginationWrapperProps<TItem> {
  active?: (item: TItem) => boolean;
  itemKey?: (item: TItem, i: number) => string | number;
  onClick?: (item: TItem) => void;
  custom?: boolean;
  className?: string;
  entryName?: string;
  initialized?: () => Promise<void>;
  children: (item: TItem) => React.ReactNode;
}

export function PagedItemList<TItem>({
  itemKey,
  active,
  custom,
  entryName,
  onClick,
  initialized,
  className,
  children,
  usePager,
}: PagedItemListProps<TItem>) {
  const { items, loading, refresh } = usePager();

  useEffect(() => {
    (async () => {
      if (!items) await refresh();
      await initialized?.();
    })();
  }, []);

  return (
    <>
      <div className={cn('overflow-auto flex-1', className)}>
        {items?.length ? (
          items.map((item, i) =>
            custom ? (
              <React.Fragment key={itemKey?.(item, i) ?? i}>
                {children(item)}
              </React.Fragment>
            ) : (
              <Item
                key={itemKey?.(item, i) ?? i}
                className={
                  active &&
                  `cursor-pointer overflow-hidden${active?.(item) ? ' bg-secondary text-secondary-foreground' : ''}`
                }
                variant={'outline'}
                role="listitem"
                onClick={onClick && (() => onClick(item))}
              >
                {children(item)}
              </Item>
            ),
          )
        ) : (
          <EmptyEntries module={entryName ?? 'default.entry'} />
        )}
      </div>
      <PaginationWrapper usePager={usePager} />
    </>
  );
}
