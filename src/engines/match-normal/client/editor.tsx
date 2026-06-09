'use client';
import {MatchEditor, MatchEditorProps} from "@/engines/lorebooks/client/match-editor-models";
import {CustomCombobox} from "@/components/custom/combobox/component";
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";

const configId = "normal";

function Content({defaultValue}: MatchEditorProps) {
    const t = useTranslations();
    if (!Array.isArray(defaultValue) && !defaultValue.every((item: any) => typeof item === "string"))
        defaultValue = [];

    return (
        <Field>
            <FieldLabel htmlFor={"lorebook-keyword"}>
                {t("lorebook.include_any_word")}
            </FieldLabel>
            <CustomCombobox id={"lorebook-keyword"} name={"keyword"}
                            defaultValue={defaultValue}/>
        </Field>
    );
}

export const config: MatchEditor =
    {
        id: configId,
        component: Content,
        getValue: (data) => {
            return data.getAll("keyword") as string[];
        }
    } as const;