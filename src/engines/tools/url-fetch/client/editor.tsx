'use client';

import {useTranslations} from 'next-intl';
import {UrlFetchConfigModel} from "@/engines/tools/url-fetch/models";
import {mergeObjects} from "@/utils";
import {LlmapiToolProps} from "@/engines/tools/client/models";
import {Field, FieldContent, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";

const defaultConfig: UrlFetchConfigModel = {
    maxResults: 3,
    timeout: 10000,
    maxLength: 8000,
};

export function Editor({defaultValue, entry}: LlmapiToolProps) {
    const t = useTranslations();
    const config: UrlFetchConfigModel = mergeObjects(defaultConfig, defaultValue);

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor={`${entry.id}-maxResults`}>
                    {t('url_fetch.max_results')}
                </FieldLabel>
                <Input
                    id={`${entry.id}-maxResults`}
                    defaultValue={config.maxResults ?? 1}
                    name="max_result_count"
                    type="number"
                    min={1}
                    max={5}
                />
            </Field>

            <Field>
                <FieldLabel htmlFor={`${entry.id}-timeout`}>
                    {t('url_fetch.timeout')}
                </FieldLabel>
                <FieldContent className={"flex-row"}>
                    <Input
                        id={`${entry.id}-timeout`}
                        name="timeout"
                        defaultValue={config.timeout ?? 5}
                        min={3}
                        max={30}
                        step={1}
                    />
                    <span className="m-auto text-muted-foreground">
                        s
                    </span>
                </FieldContent>
            </Field>

            <Field>
                <FieldLabel htmlFor={`${entry.id}-max_length`}>
                    {t('url_fetch.max_length')}
                </FieldLabel>
                <Input
                    id={`${entry.id}-max_length`}
                    name="max_length"
                    defaultValue={config.maxLength ?? 8000}
                    min={3}
                    max={30}
                    step={1}
                />
            </Field>
        </div>
    );
}