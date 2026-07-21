'use client';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor
} from "@/components/ui/combobox";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {ComboboxRoot} from "@base-ui/react";

interface TagBoxProps {
    id?: string,
    name?: string,
    placeholder?: string,
    defaultValue?: string[] | null,
    value?: string[] | null,
    onValueChange?: (value: string[] | null) => void,
    items?: string[],
}

export function TagBox(
    {
        id, name,
        placeholder,
        defaultValue,
        value,
        onValueChange,
        items,
    }: TagBoxProps) {
    const anchor = useComboboxAnchor();
    const [input, setInput] = useState("");

    return (
        <Combobox multiple
                  autoHighlight
                  name={name}
                  id={id}
                  defaultValue={defaultValue}
                  value={value}
                  onValueChange={onValueChange}
                  inputValue={input}
                  onInputValueChange={e => setInput(e)}>
            <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                    {(values?: string[]) => (
                        <>
                            {values?.map((value: string) => (
                                <ComboboxChip key={value}>
                                    {value}
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput placeholder={placeholder}/>
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}
                             className={items ? undefined : "hidden"}>
                <ComboboxList>
                    {!(items?.includes(input)) &&
                        <ComboboxItem value={input}>
                            {input}
                        </ComboboxItem>}
                    {
                        items?.map((value: string) => (
                            <ComboboxItem key={value} value={value}>
                                {value}
                            </ComboboxItem>))
                    }
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

interface RemoteSearchComboboxProps<T> {
    name?: string,
    id?: string,
    labelAccessor?: (u: T) => string,
    // only for form
    valueAccessor?: (u: T) => string,
    comparer?: (u: T, v: T) => boolean,
    searchHandler: (search: string | null) => Promise<T[] | undefined>,
    customItemRender?: (item: T) => React.ReactNode,
}

interface RemoteSearchComboboxMultipleProps<T> extends RemoteSearchComboboxProps<T> {
    multiple: true,
    defaultValue?: T[] | null,
    value?: T[] | null,
    onValueChange?: (value: T[] | null, eventDetails: ComboboxRoot.ChangeEventDetails) => void,
}


interface RemoteSearchComboboxSingleProps<T> extends RemoteSearchComboboxProps<T> {
    multiple?: false,
    defaultValue?: T | null,
    value?: T | null,
    onValueChange?: (value: T | null, eventDetails: ComboboxRoot.ChangeEventDetails) => void,
}

export function RemoteSearchCombobox<T>(
    {
        name, id,
        multiple,
        defaultValue,
        value,
        onValueChange,
        searchHandler,
        comparer,
        labelAccessor,
        valueAccessor,
        customItemRender,
    }: RemoteSearchComboboxMultipleProps<T> | RemoteSearchComboboxSingleProps<T>) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const [searchItems, setSearchItems] = useState<T[]>([]);
    const [searchMark, setSearchMark] = useState(true);
    const [searchText, setSearchText] = useState<string | null>(null);
    const handleSearch = async (search: string | null) => {
        setSearchText(search);
        setSearchMark(true);
    };

    useEffect(() => {
        if (!searchMark) return;
        const timer = setTimeout(async () => {
            const res = await searchHandler(searchText) ?? [];
            setSearchItems(res);
            setSearchMark(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchMark, searchText]);

    return (
        <Combobox multiple={multiple} autoHighlight name={name} id={id}
                  defaultValue={defaultValue}
                  value={value}
                  onValueChange={onValueChange as any}
                  isItemEqualToValue={comparer}
                  itemToStringValue={valueAccessor}
                  itemToStringLabel={labelAccessor}
                  onInputValueChange={e => handleSearch(e)}
                  items={searchItems}>
            <ComboboxChips ref={anchor} className="w-full">
                {
                    multiple ?
                        <ComboboxValue>
                            {(values?: T[] | null) => (
                                <>
                                    {values?.map((item) => (
                                        <ComboboxChip key={valueAccessor?.(item) ?? item as string}>
                                            {labelAccessor?.(item) ?? item as string}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput/>
                                </>
                            )}
                        </ComboboxValue> :
                        <ComboboxChipsInput/>
                }
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                <ComboboxList>
                    {(item: T) => {
                        return (
                            <ComboboxItem key={valueAccessor?.(item) ?? item as string} value={item}>
                                {customItemRender?.(item) ?? labelAccessor?.(item) ?? item as string}
                            </ComboboxItem>
                        );
                    }}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

