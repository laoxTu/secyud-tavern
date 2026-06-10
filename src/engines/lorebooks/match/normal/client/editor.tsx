'use client';
import {MatcherProps} from "@/engines/lorebooks/client/match-models";
import {CustomCombobox} from "@/components/custom/combobox/component";
import {Field, FieldLabel} from "@/components/ui/field";
import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {NormalMatchModel} from "@/engines/lorebooks/match/normal/models";
import {engineName} from "@/engines/lorebooks/models";
import {Input} from "@/components/ui/input";


export function MatchEditor({defaultValue}: MatcherProps) {
    const t = useTranslations();
    const model: NormalMatchModel = {
        keywords: [],
        keywordsLength: 1,
        fitCount: 1,
        ...(defaultValue ?? {})
    }
    const [keywordsLength, setKeywordsLength] = useState(model.keywordsLength);
    const maxLength = 4;
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${engineName}-fitCount`}>
                        {t("lorebook.fit_count")}
                    </FieldLabel>
                    <Input id={`${engineName}-fitCount`} type={"number"}
                           min={1} max={Math.max(keywordsLength, 1)} step={1}
                           defaultValue={model.fitCount} name={"fitCount"}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-keywordsLength`}>
                        {t("lorebook.keywords_groups_length")}
                    </FieldLabel>
                    <Input id={`${engineName}-keywordsLength`} type={"number"}
                           min={1} max={maxLength} step={1}
                           value={keywordsLength}
                           onChange={e =>
                               setKeywordsLength(clamp(parseInt(e.target.value), 1, maxLength))}
                           name={"keywordsLength"}/>
                </Field>
                {Array.from({length: keywordsLength}).map((_, index) => (
                    <Field key={index}>
                        <FieldLabel htmlFor={`${engineName}-keywords-${index}`}>
                            {`${t("lorebook.include_any_word")} ${index + 1}`}
                        </FieldLabel>
                        <CustomCombobox id={`${engineName}-keywords-${index}`}
                                        name={`keywords-${index}`}
                                        defaultValue={model.keywords.length > index ? model.keywords[index] : []}/>
                    </Field>
                ))}

            </div>
        </>
    );
}
