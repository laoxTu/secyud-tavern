import {MatchEditorProps} from "@/app/business/preset/lorebook/MatchEditor";
import CustomCombobox from "@/components/combobox/CustomCombobox";
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";

export const defaultValue = [];
export const validate = (value: any) =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

export default function NormalMatchEditor({value, onValueChanged}: MatchEditorProps) {
    const t = useTranslations();
    return (
        <Field>
            <FieldLabel>
                {t("lorebook.include_any_word")}
            </FieldLabel>
            <CustomCombobox value={value} onValueChange={onValueChanged}/>
        </Field>
    );
}