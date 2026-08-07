'use client';
import React, {ComponentType, useState} from "react";
import {useTranslations} from "next-intl";
import {useErrorHandler} from "@/handler/client/error";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {ModelState} from "@/business/client/models";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {FileDownIcon, FilePlusIcon} from "lucide-react";

type CreateProps<TModel> =
    | {
    // 创建 FieldGroup 的内部内容。
    createContent: () => React.ReactNode;
    // 根据表单创建模型，返回创建后的模型。
    createHandler: (data: FormData) => Promise<TModel>,
    createComponent?: never;
}
    | {
    createContent?: never;
    createHandler?: never;
    createComponent: ComponentType;
};

// 定义 Import 的两种模式（互斥）
type ImportProps<TModel> =
    | {
    // 根据文件导入模型，返回创建后的模型。
    importHandler: (file: File) => Promise<TModel>,
    // 接受的导入文件类型
    importAccept: string,
    importComponent?: never;
}
    | {
    // 替换导入组件
    importComponent: ComponentType;
    importHandler?: never;
    importAccept?: never;
};

export type ModelCreateProps<TModel> = CreateProps<TModel> & ImportProps<TModel>;

interface Props<TModel> {
    modelState: ModelState<TModel>,
    props: ModelCreateProps<TModel>,
}

function ModelCreateDialog<TModel>(
    {
        modelState: {
            moduleName,
            usePagedItemsState,
            useItemState,
        },
        props: {
            createContent,
            createHandler,
            createComponent: Component,
        },
    }: Props<TModel>) {

    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);

    const {fetch} = usePagedItemsState();
    const {setModel} = useItemState();

    const handleCreate = async (data: FormData) => {
        try {
            if (!createHandler) return;
            const model = await createHandler(data);
            setModel(model);
            await fetch();
            handleSuccess(t("default.created_successfully"));
        } catch (error) {
            handleError(error);
        } finally {
            setCreateOpen(false);
        }
    };

    if (Component) {
        return <Component/>
    }

    return (<Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <TooltipTrigger onClick={() => setCreateOpen(true)}
                            render={<Button/>}>
                <FilePlusIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('default.create')}</p>
            </TooltipContent>
        </DialogTrigger>
        <DialogContent render={<form action={handleCreate}/>}>
            <DialogHeader>
                <DialogTitle>
                    {t("default.create_title", {target: t(`default.${moduleName}`)})}
                </DialogTitle>
                <DialogDescription>
                    {t("default.create_description", {target: t(`default.${moduleName}`)})}
                </DialogDescription>
            </DialogHeader>
            <FieldGroup>
                {createContent()}
            </FieldGroup>
            <DialogFooter>
                <Button type="submit">
                    {t("default.create")}
                </Button>
                <DialogClose render={<Button variant="outline"/>}>
                    {t("default.cancel")}
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

function ModelImportDialog<TModel>(
    {
        modelState: {
            moduleName,
            usePagedItemsState,
            useItemState,
        },
        props: {
            importHandler,
            importAccept,
            importComponent: Component,
        },
    }: Props<TModel>) {

    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const [importOpen, setImportOpen] = useState(false);
    const {fetch} = usePagedItemsState();
    const {setModel} = useItemState();

    const handleImport = async (formData: FormData) => {
        try {
            if (!importHandler) return;
            const file = formData.get("filename") as File;
            const model = await importHandler(file);
            setModel(model);
            await fetch();
            setImportOpen(false);
            handleSuccess(t("default.imported_successfully"));
        } catch (error) {
            handleError(error);
        }
    };

    if (Component) {
        return <Component/>
    }

    return (<Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <TooltipTrigger onClick={() => setImportOpen(true)}
                            render={<Button variant="outline"/>}>
                <FileDownIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('default.import')}</p>
            </TooltipContent>
        </DialogTrigger>
        <DialogContent render={<form action={handleImport}/>}>
            <DialogHeader>
                <DialogTitle>
                    {t("default.import_title", {target: t(`default.${moduleName}`)})}
                </DialogTitle>
                <DialogDescription>
                    {t("default.import_description", {target: t(`default.${moduleName}`)})}
                </DialogDescription>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-filename`}>{t("default.name")}</FieldLabel>
                    <Input id={`${moduleName}-filename`} name="filename" type="file"
                           accept={importAccept} required/>
                </Field>
            </FieldGroup>
            <DialogFooter>
                <Button type="submit">
                    {t("default.import")}
                </Button>
                <DialogClose render={<Button variant="outline"/>}>
                    {t("default.cancel")}
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

export function ModelCreate<TModel>(props: Props<TModel>) {
    return (
        <>
            <ModelCreateDialog {...props} />
            <ModelImportDialog {...props} />
        </>
    );
}
