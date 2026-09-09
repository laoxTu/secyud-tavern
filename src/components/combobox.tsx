'use client';
import { ComboboxRoot } from '@base-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';

import { DataRequest, DataResponse, NameValue } from '@/database';
import { cn } from '@/lib/utils';
import { jsonUtils } from '@/utils';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '.';

interface TagBoxProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  value?: string[] | null;
  onValueChange?: (
    value: string[] | null,
    eventDetails: ComboboxRoot.ChangeEventDetails,
  ) => void;
  items?: string[];
}

export function TagBox({
  id,
  name,
  placeholder,
  className,
  value: defaultValue,
  onValueChange,
  items,
}: TagBoxProps) {
  const anchor = useComboboxAnchor();
  const [input, setInput] = useState('');
  const [value, setValue] = useState(defaultValue ?? null);

  return (
    <Combobox
      multiple
      autoHighlight
      name={name}
      id={id}
      value={value}
      onValueChange={(value, e) => {
        onValueChange?.(value as any, e);
        setValue(value);
      }}
      inputValue={input}
      onInputValueChange={(e) => setInput(e)}
    >
      <ComboboxChips ref={anchor} className={cn('w-full', className)}>
        <ComboboxValue>
          {(values?: string[]) => (
            <>
              {values?.map((value: string) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={placeholder} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor} className={items ? undefined : 'hidden'}>
        <ComboboxList>
          {!items?.includes(input) && (
            <ComboboxItem value={input}>{input}</ComboboxItem>
          )}
          {items?.map((value: string) => (
            <ComboboxItem key={value} value={value}>
              {value}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

type Fetcher = (
  request: DataRequest,
  fuzzy?: string | null,
) => Promise<DataResponse<NameValue>>;

interface RemoteSearchComboboxProps {
  name?: string;
  id?: string;
  itemHeight?: number;
  size?: number;
  fetcher: Fetcher;
  itemRender?: (item: NameValue) => React.ReactNode;
}

interface RemoteSearchComboboxMultipleProps extends RemoteSearchComboboxProps {
  multiple: true;
  value?: NameValue[] | null;
  onValueChange?: (
    value: NameValue[] | null,
    eventDetails: ComboboxRoot.ChangeEventDetails,
  ) => void;
}

interface RemoteSearchComboboxSingleProps extends RemoteSearchComboboxProps {
  multiple?: false;
  value?: NameValue | null;
  onValueChange?: (
    value: NameValue | null,
    eventDetails: ComboboxRoot.ChangeEventDetails,
  ) => void;
}

class SearchCache {
  // page / items
  items: Record<number, NameValue[]> = {};
  fuzzy: string | undefined | null;
  length: number | null = null;

  constructor(
    private readonly size: number,
    private readonly fetcher: Fetcher,
  ) {}

  item(index: number, finish: () => void) {
    const page = Math.floor(index / this.size);
    const i = index % this.size;
    const cur = this.items[page];
    if (!cur) {
      void this.fetch(page, finish);
    }
    return cur?.at(i);
  }

  async fetch(page: number, finish: () => void) {
    if (this.length !== null && page * this.size >= this.length) return;
    if (this.items[page]) return;
    this.items[page] = [];
    const data = await this.fetcher(
      {
        skip: page * this.size,
        size: this.size,
      },
      this.fuzzy?.trim(),
    );
    this.length = data.length;
    this.items[page] = data.items;
    finish();
  }

  search(fuzzy: string | null, finish: () => void) {
    return setTimeout(async () => {
      this.items = {};
      this.fuzzy = fuzzy;
      this.length = null;
      await this.fetch(0, finish);
    }, 300);
  }
}

/**
 * 远程获取的combobox
 * 有Bug，初次渲染列表时组件
 * @constructor
 */
export function RemoteSearchCombobox({
  name,
  id,
  multiple,
  itemHeight,
  size,
  value: defaultValue,
  onValueChange,
  fetcher,
  itemRender,
}: RemoteSearchComboboxMultipleProps | RemoteSearchComboboxSingleProps) {
  size ??= 5;
  const t = useTranslations();
  const anchor = useComboboxAnchor();
  const cache = useRef(new SearchCache(size, fetcher));
  const [search, setSearch] = useState<string | null>(null);
  const [value, setValue] = useState(defaultValue ?? null);
  const [inputValue, setInputValue] = useState(
    (Array.isArray(defaultValue) ? undefined : defaultValue?.name) ?? '',
  );

  const listRef = useRef<HTMLDivElement>(null);
  // ✅ 新增：配置虚拟滚动器
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    // 总数据量
    count: cache.current.length ?? size,
    // 滚动容器
    getScrollElement: () => listRef.current,
    // 每项预估高度（根据你的实际样式调整）
    estimateSize: () => itemHeight ?? 32,
    // 上下额外多渲染5项，防止滚动白屏
    overscan: 5,
  });

  const refresh = () => {
    virtualizer.measure();
  };

  useEffect(() => {
    const timer = cache.current.search(search, refresh);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Combobox
      multiple={multiple}
      autoHighlight
      name={name}
      id={id}
      isItemEqualToValue={(l, r) => l.value === r.value}
      itemToStringValue={(u) => JSON.stringify(u)}
      itemToStringLabel={(u) => u.name}
      onOpenChange={(open) => {
        if (open) {
          // 下拉打开时，延迟一帧让 DOM 渲染完成，然后重新测量
          requestAnimationFrame(() => {
            virtualizer.measure();
          });
        }
      }}
      onValueChange={(value, e) => {
        onValueChange?.(value as any, e);
        setValue(value);
      }}
      value={value}
      inputValue={inputValue}
      onInputValueChange={(value) => {
        setInputValue(value);
        setSearch(value);
      }}
    >
      {multiple ? (
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values?: NameValue[] | null) => (
              <>
                {values?.map((u, i) => (
                  <ComboboxChip key={u.value ?? i}>
                    {itemRender?.(u) ?? u.name}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
      ) : (
        <ComboboxInput showClear />
      )}
      <ComboboxContent anchor={anchor}>
        {!cache.current.length && (
          <ComboboxEmpty>{t('default.empty_items')}</ComboboxEmpty>
        )}
        <ComboboxList render={<div ref={listRef} className="relative" />}>
          <div
            className={'relative'}
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualizer
              .getVirtualItems()
              .map((u) => cache.current.item(u.index, refresh))
              .filter((item) => !!item)
              .map((u, i) => {
                return (
                  <ComboboxItem key={u?.value ?? i} value={u}>
                    {itemRender?.(u) ?? u.name}
                  </ComboboxItem>
                );
              })}
          </div>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export const combobox = {
  get(data: FormData, name: string): NameValue {
    return jsonUtils.parse(data.get(name) as string);
  },
  getAll(data: FormData, name: string): NameValue[] {
    return data.getAll(name).map((u) => jsonUtils.parse(u as string));
  },
};
