'use client';
import {MatcherProps} from "@/engines/lorebooks/client/match-models";
import {useTranslations} from "next-intl";
import React from "react";
import {Field, FieldLabel} from "@/components/ui/field";
import {engineName} from "@/engines/lorebooks/models";
import {AlwaysMatchModel} from "@/engines/lorebooks/match/always/models";
import {Checkbox} from "@/components/ui/checkbox";


export function MatchEditor({defaultValue}: MatcherProps) {
    const t = useTranslations();
    const model: AlwaysMatchModel = {
        lastMessage: false,
        ...(defaultValue ?? {})
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Field orientation="horizontal">
                    <Checkbox id={`${engineName}-lastMessage`}
                              defaultChecked={model.lastMessage}
                              name={"lastMessage"}
                    />
                    <FieldLabel htmlFor={`${engineName}-lastMessage`}>
                        {t("lorebook.last_message")}
                    </FieldLabel>
                </Field>
            </div>
        </>
    );
}