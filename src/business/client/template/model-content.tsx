'use client';
import React, {useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {ModelState} from "@/business/client/models";
import {TabManager} from "@/components/custom/tab";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {FieldGroup} from "@/components/ui/field";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {FileTextIcon} from "lucide-react";

export interface ModelContentProps<TModel> {
    // 克隆 FieldGroup 的内部内容
    cloneContent: (model: TModel) => React.ReactNode,
    // 根据原模型和表单克隆模型，返回克隆后的模型。注意传入模型不带详情。
    cloneHandler: (model: TModel, data: FormData) => Promise<TModel>,
    // 导出模型，一般用 window.open(`/api/${apiName}/${model.id}/export`)
    exportHandler: (model: TModel) => Promise<void>,
    // 删除模型
    deleteHandler: (model: TModel) => Promise<void>,
    tabManager: TabManager;
}

interface Props<TModel> {
    modelState: ModelState<TModel>,
    props: ModelContentProps<TModel>,
}

export function ModelContent<TModel>(
    {
        modelState: {
            moduleName,
            useItemState,
            usePagedItemsState,
        },
        props: {
            cloneContent,
            cloneHandler,
            exportHandler,
            deleteHandler,
            tabManager,
        }
    }: Props<TModel>) {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const [cloneOpen, setCloneOpen] = useState(false);
    const {model, setModel} = useItemState();
    const {fetch} = usePagedItemsState();

    const refresh = async (model?: TModel) => {
        setModel(model);
        await fetch();
    }

    const handleExport = async () => {
        try {
            if (model) {
                await exportHandler(model);
            }
        } catch (err) {
            handleError(err);
        }
    };

    const handleClone = async (data: FormData) => {
        try {
            if (model) {
                const result = await cloneHandler(model, data);
                console.debug(`[handle clone: ${moduleName}]`, result);
                await refresh(result);
                setCloneOpen(false);
                handleSuccess(t("default.copy_successfully"));
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleDelete = async () => {
        try {
            if (model) {
                await deleteHandler(model);
                await refresh(undefined);
                handleSuccess(t("default.delete_successfully"));
            }
        } catch (err) {
            handleError(err);
        }
    };

    if (!model) {
        return (<div className={"flex h-full pb-24"}>
            <Empty className={"m-auto"}>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileTextIcon/>
                    </EmptyMedia>
                    <EmptyTitle>{t("default.select_title", {target: t(`default.${moduleName}`)})}</EmptyTitle>
                    <EmptyDescription>
                        {t("default.select_description", {target: t(`default.${moduleName}`)})}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>);
    }

    const tabs = tabManager.getSorted();

    return (
        <Tabs defaultValue={tabManager.getFirstTab()?.id}
              className={"flex flex-col overflow-hidden h-full p-4"}>
            <div className="flex justify-between">
                <TabsList className="gap-1">
                    {tabs.map((tab, index) => {
                        const Component = tab.label;
                        return (
                            <TabsTrigger key={index} value={tab.id}>
                                <Component/>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
                <div className="flex gap-2">
                    <Button onClick={handleExport}>{t("default.export")}</Button>
                    <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">{t("default.copy")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleClone}
                                  className="form-reset">
                                <DialogHeader>
                                    <DialogTitle>
                                        {t("default.copy_title", {target: t(`default.${moduleName}`)})}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t("default.copy_description", {target: t(`default.${moduleName}`)})}
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup>
                                    {cloneContent(model)}
                                </FieldGroup>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">{t("default.cancel")}</Button>
                                    </DialogClose>
                                    <Button type="submit">{t("default.copy")}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">{t("default.delete")}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t("default.delete_title", {target: t(`default.${moduleName}`)})}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("default.delete_description", {target: t(`default.${moduleName}`)})}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t("default.cancel")}</AlertDialogCancel>
                                <AlertDialogAction variant={"destructive"} onClick={handleDelete}>
                                    {t("default.delete")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            {tabs.map((tab, i) => {
                const Component = tab.component;
                if (!Component) return null;
                return (
                    <TabsContent key={i} value={tab.id} className="flex-1 overflow-hidden">
                        <Component/>
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}