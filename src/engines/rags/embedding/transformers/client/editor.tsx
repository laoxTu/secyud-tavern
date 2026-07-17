import {Field, FieldLabel} from "@/components/ui/field";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import React from "react";
import {useTranslations} from "next-intl";
import {useRagSettingState} from "@/engines/rags/client/models";
import {transformerModels} from "@/engines/rags/embedding/transformers/client/index";

export function Editor() {
    const t = useTranslations();
    const {embeddingGeneratorConfig} = useRagSettingState();

    return (<>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor="transformers-model">
                    {t("rag.embedding_generator_model")}
                </FieldLabel>
                <Select name="model" defaultValue={embeddingGeneratorConfig["model"]}>
                    <SelectTrigger className="w-full"
                                   id={`transformers-model`}>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Object.keys(transformerModels).map((v) =>
                                <SelectItem key={v} value={v}>
                                    {v}
                                </SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
        </div>
    </>);
}