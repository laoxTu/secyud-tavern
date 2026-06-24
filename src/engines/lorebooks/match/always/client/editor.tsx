'use client';
import {MatcherProps} from "@/engines/lorebooks/client/match-models";
import {useTranslations} from "next-intl";
import React from "react";
import {Field, FieldLabel} from "@/components/ui/field";
import {engineName} from "@/engines/lorebooks/models";
import {AlwaysMatchModel} from "@/engines/lorebooks/match/always/models";
import {Checkbox} from "@/components/ui/checkbox";
import {mergeObjects} from "@/utils";


export function MatchEditor({defaultValue, entry}: MatcherProps) {
    const t = useTranslations();
    const model: AlwaysMatchModel = mergeObjects({lastMessage: false}, defaultValue);

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Field orientation="horizontal">
                    <Checkbox key={model.lastMessage ? 1 : 0}
                              id={`${engineName}-lastMessage-${entry.id}`}
                              defaultChecked={model.lastMessage}
                              name={"lastMessage"}
                    />
                    <FieldLabel htmlFor={`${engineName}-lastMessage-${entry.id}`}>
                        {t("lorebook.last_message")}
                    </FieldLabel>
                </Field>
            </div>
        </>
    );
}