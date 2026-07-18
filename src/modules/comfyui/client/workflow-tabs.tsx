'use client';
import React, {RefObject} from "react";
import {useTranslations} from "next-intl";
import {FileIcon, TriangleIcon} from "lucide-react";
import {post, put} from "@/client";
import {Field, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TabManager} from "@/components/custom/tab";
import {TemplateModelUpdate} from "@/business/client/template";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {moduleName, ComfyUIWorkflowModel} from "../models";
import {modelState} from "./models";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {useErrorHandler} from "@/handler/client/error";
import {submitTargetFormOnKey} from "@/business/client";

function UpdateContent({model, formRef}: { model: ComfyUIWorkflowModel, formRef: RefObject<HTMLFormElement | null> }) {
    const t = useTranslations();

    const {handleError, handleSuccess} = useErrorHandler();
    const generateParameter = async () => {
        try {

            await post('/comfyuis/workflows/{id}/generate-parameters', {}, {
                params: {id: model.id}
            });
            handleSuccess(t("comfyui.generate_parameter_successfully"));
        } catch (err) {
            handleError(err);
        }
    };

    return (<>
        <div className="grid md:grid-cols-2 gap-4">
            <Field>
                <FieldLabel htmlFor={`${moduleName}-code`}>
                    {t("default.code") + "*"}
                </FieldLabel>
                <Input id={`${moduleName}-code`} name="code"
                       defaultValue={model.code} disabled/>
            </Field>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-name`}>
                    {t("default.name")}
                </FieldLabel>
                <Input name="name" id={`${moduleName}-name`}
                       defaultValue={model.name}/>
            </Field>
        </div>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-workflow_content`}>
                {t("default.content")}
                <Tooltip>
                    <TooltipTrigger onClick={generateParameter}
                                    render={<Button variant={"ghost"} size={'icon'}/>}>
                        <TriangleIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        {t("comfyui.generate_parameter")}
                    </TooltipContent>
                </Tooltip>
            </FieldLabel>
            <MonacoEditor name={'workflow_content'}
                          defaultValue={model?.content?.workflow}
                          language={'json'} formRef={formRef}/>
        </Field>
        <Field>
            <FieldLabel htmlFor={`${moduleName}-description`}>
                {t("default.description")}
            </FieldLabel>
            <Textarea onKeyDown={submitTargetFormOnKey} name={'description'}
                      id={`${moduleName}-description`}
                      defaultValue={model.content.description}/>
        </Field>
    </>);
}

export function DefaultTab() {
    return <TemplateModelUpdate<ComfyUIWorkflowModel>
        modelState={modelState}
        props={{
            updateHandler: async (model, data) => {

                return await put("/comfyuis/workflows/{id}",
                    {
                        content: {
                            workflow: data.get("workflow_content"),
                            description: data.get("description") as string,
                        },
                        name: data.get("name") as string,
                        code: model.code,
                    },
                    {
                        params: {"id": model.id,}
                    });
            },
            updateContent: (model, formRef) =>
                (<UpdateContent model={model} formRef={formRef}/>)
        }}

    />
}

export const comfyuiWorkflowTabManager = new TabManager(moduleName + "Workflow", {
    id: 'default',
    label: () => <EntryTabHeader space="default" value="property" icon={FileIcon}/>,
    component: DefaultTab
});