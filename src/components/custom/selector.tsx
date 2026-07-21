'use client';
import React from "react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface SelectorProps<T> {
    items: T[],
    defaultValue?: T | null,
    value?: T | null,
    onValueChange?: (value: T | null) => void,
    id?: string,
    name?: string,
    labelAccessor?: (u: T) => string,
    // only for form get
    valueAccessor?: (u: T) => string,
}

export function Selector<T>(
    {
        id,
        name,
        items,
        defaultValue,
        value,
        onValueChange,
        labelAccessor,
        valueAccessor,
    }: SelectorProps<T>) {
    return (<Select name={name}
                    itemToStringLabel={labelAccessor}
                    itemToStringValue={valueAccessor}
                    defaultValue={defaultValue}
                    value={value}
                    onValueChange={onValueChange}>
        <SelectTrigger className="w-full" id={id}>
            <SelectValue/>
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {items.map((e) =>
                    <SelectItem key={valueAccessor?.(e) ?? e as string} value={e}>
                        {labelAccessor?.(e) ?? e as string}
                    </SelectItem>
                )}
            </SelectGroup>
        </SelectContent>
    </Select>);
}