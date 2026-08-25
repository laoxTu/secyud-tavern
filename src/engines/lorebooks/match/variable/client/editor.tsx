'use client';
import {MatcherProps} from "@/engines/lorebooks/client/match-models";
import React from "react";
import {Field, FieldLabel} from "@/components/ui/field";
import {engineName} from "@/engines/lorebooks/models";
import {useTranslations} from "next-intl";
import {VariableMatchModel} from "@/engines/lorebooks/match/variable/models";
import {mergeObjects} from "@/utils";
import {Input} from "@/components/ui/input";

export function MatchEditor({defaultValue, entry}: MatcherProps) {
    const t = useTranslations();
    const model: VariableMatchModel = mergeObjects({
        path: "relatedDates/0/year",
        value: "1",
    }, defaultValue)
    return (<>
            <Field>
                <FieldLabel htmlFor={`${engineName}-path-${entry.id}`}>
                    {t("default.path")}
                </FieldLabel>
                <Input id={`${engineName}-path-${entry.id}`}
                       name={`match_path`}
                       defaultValue={model.path}/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${engineName}-value-${entry.id}`}>
                    {t("default.value")}
                </FieldLabel>
                <Input id={`${engineName}-value-${entry.id}`}
                       name={`match_value`}
                       defaultValue={model.value}/>
            </Field>
        </>
    );
}