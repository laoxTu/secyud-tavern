'use client';
import React, {Context} from "react";
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {useErrorHandler} from "@/client/errors";
import {BaseModel} from "@/shared/business";
import {ModelContextType, useModelContext} from "@/client/business/template/context";

export interface EditFormTemplateProps<TModel extends BaseModel> {
    modelType: string,
    contextType: Context<ModelContextType<TModel> | undefined>,
    updateHandler: (model: TModel, data: FormData) => Promise<void>,
    updateContent: (model: TModel) => React.ReactNode,
    className?: string,
}

export function EditFormTemplate<TModel extends BaseModel>(
    {
        modelType,
        contextType,
        updateHandler,
        updateContent,
        className = "h-full",
    }: EditFormTemplateProps<TModel>) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const {model, refreshModel} = useModelContext<TModel>(contextType, modelType, t);
    if (!model) {
        throw new Error('model is not available at this time');
    }

    const handleUpdate = async (data: FormData) => {
        try {
            await updateHandler(model, data);
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshModel();
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <form className={className}
              action={handleUpdate}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        {updateContent(model)}
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                    <Button type="button" variant={"outline"} onClick={refreshModel}>{t("default.reset")}</Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
