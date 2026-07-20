import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/modules/comfyui/models";
import {Input} from "@/components/ui/input";
import React from "react";
import {useTranslations} from "next-intl";

export function Component() {
    const t = useTranslations();
    return <>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-import-modelId`}>
                {t("comfyui.civitai.model_id")}
            </FieldLabel>
            <Input id={`${moduleName}-import-modelId`}
                   name="modelId" type={"number"}/>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-import-modelVersionId`}>
                {t("comfyui.civitai.model_version_id")}
            </FieldLabel>
            <Input id={`${moduleName}-import-modelVersionId`}
                   name="modelVersionId" type={"number"}/>
        </Field>
    </>;
}
