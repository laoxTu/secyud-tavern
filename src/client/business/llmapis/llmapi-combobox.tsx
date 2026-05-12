'use client';
import {useCallback, useEffect, useState} from "react";
import {get} from "@/client";
import {useErrorHandler} from "@/client/errors";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue, useComboboxAnchor
} from "@/components/ui/combobox";
import {useTranslations} from "next-intl";
import {RequireModel} from "@/shared/business/presets";
import {PagedResult} from "@/shared/business";
import {LlmapiModel} from "@/shared/business/llmapis";

interface RequiresComboboxProps {
    defaultValue: RequireModel | null,
    name?: string,
    id?: string,
}

export function LlmapiCombobox({defaultValue, name, id}: RequiresComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const {handleError} = useErrorHandler();
    const [searchRequires, setSearchRequires] = useState<RequireModel[]>([]);
    const [value, setValue] = useState<RequireModel | null>(defaultValue);
    const [needSearch, setNeedSearch] = useState(true);
    const [searchValue, setSearchValue] = useState<string | undefined>();
    const handleSearch = useCallback(async (search: string | undefined) => {
        setSearchValue(search);
        setNeedSearch(true);
    }, []);

    useEffect(() => {
        if (!needSearch) return;
        const timer = setTimeout(async () => {
            try {
                const res = await get("/llmapis", {
                    params: {
                        search: searchValue,
                    }
                }) as PagedResult<LlmapiModel>;
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
    }, [handleError, needSearch, searchValue]);

    return (
        <Combobox autoHighlight name={name} id={id}
                  value={value} onValueChange={v => setValue(v)}
                  onInputValueChange={e => handleSearch(e)}
                  items={(() => value && searchRequires.every(u => u.code != value.code)
                      ? [...searchRequires, value] : searchRequires)()}>
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