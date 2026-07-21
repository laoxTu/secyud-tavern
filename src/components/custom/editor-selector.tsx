'use client';
import {EditorRegisterable} from "@/business/client/models";
import {ClientRegistry} from "@/plugins/client";
import React, {useState} from "react";
import {Field, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface EditorSelectorFieldProps<T extends EditorRegisterable> {
    registry: ClientRegistry<T>,
    defaultValue?: string | null,
    id?: string,
    name?: string,
    fieldLabel?: string,
    editorProps?: any,
    nameAccessor: (u: T) => string,
    valueAccessor: (u: T) => string,
}

export function EditorSelectorField<T extends EditorRegisterable>(
    {
        id,
        name,
        fieldLabel,
        registry,
        defaultValue,
        editorProps,
        nameAccessor,
        valueAccessor,
    }: EditorSelectorFieldProps<T>) {
    const items = registry.getSorted();
    const [editor, setEditor] = useState(
        defaultValue && registry.records[defaultValue] ?
            registry.records[defaultValue] : items[0]);
    const EditorComponent = editor?.component;
    return (<>
        <Field>
            <FieldLabel htmlFor={id}>
                {fieldLabel}
            </FieldLabel>
            <Select name={name}
                    value={editor}
                    itemToStringLabel={nameAccessor}
                    itemToStringValue={valueAccessor}
                    onValueChange={u => u && setEditor(u)}>
                <SelectTrigger className="w-full" id={id}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {items.map((e) =>
                            <SelectItem key={valueAccessor(e)} value={e}>
                                {nameAccessor(e)}
                            </SelectItem>
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </Field>
        {EditorComponent && <EditorComponent {...(editorProps ?? {})} />}
    </>)
}

interface SelectorProps<T> {
    items: T[],
    defaultValue?: string | null,
    value?: string | null,
    onValueChange?: (value: T | null) => void,
    id?: string,
    name?: string,
    nameAccessor: (u: T) => string,
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
        nameAccessor,
        valueAccessor,
    }: SelectorProps<T>) {
    const itemAccessor = valueAccessor ?
        (value?: string | null) => value === undefined ?
            undefined : items.find(u => valueAccessor(u) === value) ?? null :
        (value?: string | null) => value as T;
    const defaultItem = itemAccessor(defaultValue);
    const item = itemAccessor(value);
    return (<Select name={name}
                    itemToStringLabel={nameAccessor}
                    itemToStringValue={valueAccessor}
                    defaultValue={defaultItem}
                    value={item}
                    onValueChange={onValueChange}>
        <SelectTrigger className="w-full" id={id}>
            <SelectValue/>
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {items.map((e) =>
                    <SelectItem key={valueAccessor?.(e) ?? e as string} value={e}>
                        {nameAccessor(e)}
                    </SelectItem>
                )}
            </SelectGroup>
        </SelectContent>
    </Select>);
}