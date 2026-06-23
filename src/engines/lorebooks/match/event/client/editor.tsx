'use client';
import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {MatcherProps} from "@/engines/lorebooks/client/match-models";
import {MatchEditor as NormalMatchEditor} from "@/engines/lorebooks/match/normal/client/editor";
import {EventMatchModel} from "@/engines/lorebooks/match/event/models";
import {engineName} from "@/engines/lorebooks/models";
import {DateEditor} from "@/engines/lorebooks/match/event/client/date-editor";
import {mergeObjects} from "@/utils";


export function MatchEditor({defaultValue, entry}: MatcherProps) {
    const t = useTranslations();
    const model: EventMatchModel = mergeObjects({
        keywords: [],
        keywordsLength: 1,
        fitCount: 1,
        maxDate: {
            year: 0,
            month: 1,
            day: 1
        },
        minDate: {
            year: 0,
            month: 1,
            day: 1
        }
    }, defaultValue);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <FieldLabel htmlFor={`${engineName}-min-date-${entry.id}`}>
                        {t("lorebook.min_date")}
                    </FieldLabel>
                    <DateEditor id={`${engineName}-min-date-${entry.id}`}
                                defaultValue={model.minDate}
                                name={`min-date`}/>
                </Field>
                <Field>
                    <FieldLabel htmlFor={`${engineName}-max-date-${entry.id}`}>
                        {t("lorebook.max_date")}
                    </FieldLabel>
                    <DateEditor id={`${engineName}-max-date-${entry.id}`}
                                defaultValue={model.maxDate}
                                name={`max-date`}/>
                </Field>
            </div>
            <NormalMatchEditor defaultValue={defaultValue} entry={entry}/>
        </>
    );
}