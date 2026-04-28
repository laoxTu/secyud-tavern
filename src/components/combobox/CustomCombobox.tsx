import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList,
    ComboboxValue, useComboboxAnchor
} from "@/components/ui/combobox";
import {useState} from "react";
import {ComboboxChangeHandler} from "@/app/business/preset/RequiresCombobox";
import {useTranslations} from "next-intl";

interface CustomComboboxProps {
    extraValue?: any[]
    value: any[]
    onValueChange?: ComboboxChangeHandler
    id?: string
}

export default function CustomCombobox({value, onValueChange, id, extraValue}: CustomComboboxProps) {
    const t = useTranslations();
    const anchor = useComboboxAnchor();
    const [input, setInput] = useState("");

    return (
        <Combobox multiple
                  autoHighlight
                  id={id}
                  value={value}
                  onValueChange={onValueChange}
                  onInputValueChange={e => setInput(e)}
                  items={[...new Set([...extraValue ?? [], ...value, input])]}>
            <ComboboxChips ref={anchor} className="w-full">
                <ComboboxValue>
                    {(values) => (
                        <>
                            {values.map((value: string) => (
                                <ComboboxChip key={value}>{value}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput/>
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