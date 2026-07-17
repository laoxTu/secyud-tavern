'use client';
import React, {useState} from "react";
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

export interface ModelCreateProps<TModel> {
    // 创建 FieldGroup 的内部内容。
    createContent: () => React.ReactNode;
    // 根据表单创建模型，返回创建后的模型。
    createHandler: (data: FormData) => Promise<TModel>,
    // 根据文件导入模型，返回创建后的模型。
    importHandler: (file: File) => Promise<TModel>,
    // 接受的导入文件类型
    importAccept: string,
}

interface Props<TModel> {
    modelState: ModelState<TModel>,
    props: ModelCreateProps<TModel>,
}

export function ModelCreate<TModel>(
    {
        modelState: {
            moduleName,
            usePagedItemsState,
            useItemState,
        },
        props: {
            createContent,
            createHandler,
            importHandler,
            importAccept,
        },
    }: Props<TModel>) {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const {fetch} = usePagedItemsState();
    const {setModel} = useItemState();

    const handleCreate = async (data: FormData) => {
        try {
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

    const handleImport = async (formData: FormData) => {
        if (!importHandler) return;

        try {
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

    return (
        <>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger render={<Tooltip/>}>
                    <TooltipTrigger onClick={() => setCreateOpen(true)}
                                    render={<Button/>}>
                        <FilePlusIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('default.create')}</p>
                    </TooltipContent>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleCreate} className="form-reset">
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
                            <DialogClose render={<Button variant="outline"/>}>
                                {t("default.cancel")}
                            </DialogClose>
                            <Button type="submit">{t("default.create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger render={<Tooltip/>}>
                    <TooltipTrigger onClick={() => setImportOpen(true)}
                                    render={<Button variant="outline"/>}>
                        <FileDownIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('default.import')}</p>
                    </TooltipContent>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleImport}
                          className="form-reset">
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
                            <DialogClose render={<Button variant="outline"/>}>
                                {t("default.cancel")}
                            </DialogClose>
                            <Button type="submit">
                                {t("default.import")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
