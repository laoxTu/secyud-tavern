import {Field, FieldLabel} from "@/components/ui/field";
import React from "react";
import {useTranslations} from "next-intl";
import {useRagSettingState} from "@/engines/rags/client/models";
import {transformerModels} from "@/engines/rags/embedding/transformers/client/index";
import {Selector} from "@/components/custom/editor-selector";

export function Editor() {
    const t = useTranslations();
    const {embeddingGeneratorConfig} = useRagSettingState();

    return (<>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor="transformers-model">
                    {t("rag.embedding_generator_model")}
                </FieldLabel>

                <Selector name={'model'} id={`transformers-model`}
                          defaultValue={embeddingGeneratorConfig["model"] ?? null}
                          items={Object.keys(transformerModels)}
                          nameAccessor={e => e}/>
            </Field>
        </div>
    </>);
}