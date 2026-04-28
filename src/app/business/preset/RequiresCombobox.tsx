'use client';
import {useCallback, useEffect, useState} from "react";
import {RequireModel} from "@/models/require";
import {get} from "@/api/client";
import {PresetModel} from "@/business/preset/models";
import {useErrorHandler} from "@/components/message";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue, useComboboxAnchor
} from "@/components/ui/combobox";
import {useTranslations} from "next-intl";
import {PagedResult} from "@/models/common";

export type ComboboxChangeHandler = (value: any[]) => void

interface RequiresComboboxProps {
    value: any[]
    onValueChange?: ComboboxChangeHandler  // 使用类型别名
    id?: string
}

export default function RequiresCombobox({value, onValueChange, id}: RequiresComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const {handleError} = useErrorHandler();
    const [searchRequires, setSearchRequires] = useState<RequireModel[]>([]);
    const [needSearch, setNeedSearch] = useState(true);
    const [searchValue, setSearchValue] = useState<string | undefined>();
    const handleSearchRequires = useCallback(async (search: string | undefined) => {
        setSearchValue(search);
        setNeedSearch(true);
    }, []);

    useEffect(() => {
        if (!needSearch) return;
        const timer = setTimeout(async () => {
            try {
                const res = await get("/presets", {
                    params: {
                        search: searchValue,
                    }
                }) as PagedResult<PresetModel>;
                const requires = res.data.map(item => ({
                    code: item.code,
                    version: item.version
                }));
                setSearchRequires(requires);
            } catch (err) {
                handleError(err);
            }
            setNeedSearch(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [handleError, needSearch, searchValue])

    return (
        <Combobox multiple
                  autoHighlight
                  name="requires"
                  id={id}
                  value={value}
                  onValueChange={onValueChange}
                  onInputValueChange={e => handleSearchRequires(e)}
                  items={[...new Set([...searchRequires, ...value])]}>
            <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                    {(values) => (
                        <>
                            {values.map((value: RequireModel) => (
                                <ComboboxChip key={value.code}>{`${value.code}`}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput/>
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                <ComboboxList>
                    {(item: RequireModel) => (
                        <ComboboxItem key={item.code} value={item}>
                            {`${item.code}-${item.version}`}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}