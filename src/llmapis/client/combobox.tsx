'use client';
import {useCallback, useEffect, useState} from "react";
import {get} from "@/client";
import {useErrorHandler} from "@/handler/client/error";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    useComboboxAnchor
} from "@/components/ui/combobox";
import {useTranslations} from "next-intl";
import {RequireModel} from "@/presets/models";
import {PagedResult} from "@/business/models";
import {LlmapiModel} from "@/llmapis/models";
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";

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
                  defaultValue={defaultValue}
                  onInputValueChange={e => handleSearch(e)}
                  items={searchRequires}
                  itemToStringLabel={item => item.code}>
            <ComboboxInput/>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                <ComboboxList>
                    {(item: RequireModel) => (
                        <ComboboxItem key={item.code} value={item}>
                            <Item size="xs" className="p-0">
                                <ItemContent>
                                    <ItemTitle className="whitespace-nowrap">
                                        {item.code}
                                    </ItemTitle>
                                    <ItemDescription>
                                        {item.version}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}