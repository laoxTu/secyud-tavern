'use client';
import {MatchEditorProps, MatchEditor} from ".";
import {CustomCombobox} from "@/client/components/combobox";
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";

const configId = "normal";
const defaultValue = [] as const;
const validate = (value: any) =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

function Content({value, onValueChanged}: MatchEditorProps) {
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

export const config: MatchEditor =
    {
        id: configId,
        component: Content,
        defaultValue: defaultValue,
        validate: validate
    } as const;