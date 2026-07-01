'use client';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue, useComboboxAnchor
} from "@/components/ui/combobox";
import {useState} from "react";
import {useTranslations} from "next-intl";
import {submitTargetFormOnKey} from "@/business/client/index.js";


interface CustomComboboxProps {
    extraValue?: any[],
    defaultValue: any[],
    id?: string,
    placeholder?: string,
    name?: string,
}

export function CustomCombobox({defaultValue, id, name, placeholder, extraValue}: CustomComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const [input, setInput] = useState("");
    const [value, setValue] = useState(defaultValue);

    return (
        <Combobox multiple
                  autoHighlight
                  name={name}
                  id={id}
                  value={value}
                  onValueChange={setValue}
                  inputValue={input}
                  onInputValueChange={e => setInput(e)}
                  items={[...new Set([...extraValue ?? [], ...value, input])]}>
            <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                    {(values) => (
                        <>
                            {values.map((value: string) => (
                                <ComboboxChip key={value}>{value}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput placeholder={placeholder}
                                                onKeyDown={submitTargetFormOnKey}/>
                        </>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>{t("default.empty_items")}</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item} value={item}>
                            {item}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}