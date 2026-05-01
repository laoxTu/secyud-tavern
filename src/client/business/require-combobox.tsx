'use client';
import {useCallback, useEffect, useState} from "react";
import {RequireModel} from "@/shared/business";
import {get} from "../index";
import {useErrorHandler} from "../errors";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue, useComboboxAnchor
} from "@/components/ui/combobox";
import {useTranslations} from "next-intl";
import {PagedResult} from "@/shared/models";
import {PresetModel} from "@/shared/business/presets";

interface RequiresComboboxProps {
    defaultValue: RequireModel[],
    name?: string,
    id?: string,
}

export default function RequireCombobox({defaultValue, name, id}: RequiresComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const {handleError} = useErrorHandler();
    const [searchRequires, setSearchRequires] = useState<RequireModel[]>([]);
    const [value, setValue] = useState<RequireModel[]>(defaultValue);
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
    }, [handleError, needSearch, searchValue]);

    return (
        <Combobox multiple
                  autoHighlight
                  name={name}
                  id={id}
                  value={value}
                  onValueChange={setValue}
                  onInputValueChange={e => handleSearchRequires(e)}
                  items={(() => {
                      const dict: Record<string, RequireModel> = {};
                      [...searchRequires, ...value].forEach(item => dict[item.code] = item);
                      return Object.values(dict);
                  })()}>
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