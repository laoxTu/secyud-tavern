'use client';

import { SelectRootChangeEventDetails } from '@base-ui/react';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '.';

interface SelectorProps<T> {
  items: T[];
  value?: T | null;
  onValueChange?: (
    value: T | null,
    eventDetails?: SelectRootChangeEventDetails,
  ) => void;
  id?: string;
  name?: string;
  labelAccessor?: (u: T) => string;
  // only for form get
  valueAccessor?: (u: T) => string;
}

export function Selector<T>({
  id,
  name,
  items,
  value: defaultValue,
  onValueChange,
  labelAccessor,
  valueAccessor,
}: SelectorProps<T>) {
  const [value, setValue] = useState(defaultValue ?? null);
  return (
    <Select
      name={name}
      itemToStringLabel={labelAccessor}
      itemToStringValue={valueAccessor}
      defaultValue={defaultValue}
      value={value}
      onValueChange={(value, e) => {
        onValueChange?.(value as any, e);
        setValue(value ?? null);
      }}
    >
      <SelectTrigger className="w-full" id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((e) => (
            <SelectItem key={valueAccessor?.(e) ?? (e as string)} value={e}>
              {labelAccessor?.(e) ?? (e as string)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
