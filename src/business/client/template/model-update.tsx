'use client';
import React from "react";
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {useErrorHandler} from "@/handler/client/error";
import {BaseModel} from "@/business/models";
import {ModelState} from "@/business/client/models";

export interface ModelUpdateProps<TModel extends BaseModel> {
    // 根据原模型和表单更新模型，返回更新后的模型。
    updateHandler: (model: TModel, data: FormData) => Promise<TModel>;
    // 编辑 FieldGroup 的内部内容。
    updateContent: (model: TModel) => React.ReactNode;
}

interface Props<TModel extends BaseModel> {
    modelState: ModelState<TModel>;
    props: ModelUpdateProps<TModel>;
    className?: string;
}

export function ModelUpdate<TModel extends BaseModel>(
    {
        modelState: {
            usePagedItemsState,
            useItemState
        },
        props: {
            updateHandler,
            updateContent
        },
        className = "h-full",
    }: Props<TModel>) {

    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const {model, setModel} = useItemState();
    const {fetch} = usePagedItemsState();

    const refresh = async (model?: TModel) => {
        setModel(model);
        await fetch();
    }

    const handleUpdate = async (data: FormData) => {
        try {
            if (model) {
                const res = await updateHandler(model, data);
                handleSuccess(t("default.saved_successfully"));
                await refresh(res);
            }
        } catch (error) {
            handleError(error);
        }
    };

    if (!model) return null;

    return (
        <form className={className} action={handleUpdate}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        {updateContent(model)}
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
