'use client';
import React, {RefObject, useRef} from "react";
import {useTranslations} from "next-intl";
import {Field, FieldGroup, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {useErrorHandler} from "@/handler/client/error";
import {BaseModel} from "@/business/models";
import {ModelState} from "@/business/client/models";
import {GridField} from "@/components/custom/grid-field";

export interface ModelUpdateProps<TModel extends BaseModel> {
    // 根据原模型和表单更新模型，返回更新后的模型。
    updateHandler: (model: TModel, data: FormData) => Promise<void>;
    // 编辑 FieldGroup 的内部内容。
    updateContent: (model: TModel, formRef: RefObject<HTMLFormElement | null>) => React.ReactNode;
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
    const {model, setModel, render} = useItemState();
    const {fetch} = usePagedItemsState();
    const formRef = useRef<HTMLFormElement>(null);

    const handleUpdate = async (data: FormData) => {
        try {
            if (model) {
                await updateHandler(model, data);
                handleSuccess(t("default.saved_successfully"));
                await setModel(model?.id);
                // 刷新列表是为了刷新名称之类的item项
                await fetch();
            }
        } catch (error) {
            handleError(error);
        }
    };

    if (!model) return null;

    return (
        <form ref={formRef} className={className} action={handleUpdate} key={render}>
            <FieldGroup className={"flex flex-col h-full"}>
                <FieldSet className={"flex-1 p-2 overflow-auto"}>
                    <FieldGroup>
                        <GridField>
                            {updateContent(model, formRef)}
                        </GridField>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">{t("default.save")}</Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
