'use client';
import React, {useEffect, useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {ModelState, TabState, UseStoreState} from "@/business/client/models";
import {TabConfig, TabManager} from "@/components/custom/tab";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
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
import {FieldGroup} from "@/components/ui/field";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {CopyIcon, FileTextIcon, FileUpIcon, FoldHorizontalIcon} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {DeleteDialog} from "@/components/custom/delete-dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

export interface ModelContentProps<TModel> {
    // 克隆 FieldGroup 的内部内容
    cloneContent: (model: TModel) => React.ReactNode,
    // 根据原模型和表单克隆模型，返回克隆后的模型。注意传入模型不带详情。
    cloneHandler: (model: TModel, data: FormData) => Promise<TModel>,
    // 克隆 FieldGroup 的内部内容
    toolbar?: (model: TModel) => React.ReactNode,
    // 导出模型，一般用 window.open(`/api/${apiName}/${model.id}/export`)
    exportHandler: (model: TModel) => Promise<void>,
    // 删除模型
    deleteHandler: (model: TModel) => Promise<void>,
    useTabState: UseStoreState<TabState>;
    tabManager: TabManager;
}

interface Props<TModel> {
    modelState: ModelState<TModel>,
    props: ModelContentProps<TModel>,
    collapse: () => void
}

export function ModelContent<TModel>(
    {
        collapse,
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
            useTabState,
            toolbar,
            tabManager,
        }
    }: Props<TModel>) {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const [cloneOpen, setCloneOpen] = useState(false);
    const {model, setModel} = useItemState();
    const {fetch} = usePagedItemsState();
    const {tabId, setTabId} = useTabState();
    const [showTabs, setShowTabs] = useState<TabConfig[]>([]);
    const [hideTabs, setHideTabs] = useState<TabConfig[] | null>(null);

    const refresh = async (model?: TModel) => {
        await fetch();
        if (!model) {
            const items = usePagedItemsState.getState().items;
            model = items && items.length > 0 ? items[0] : undefined;
        }
        await setModel(model);
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
                const result: TModel = await cloneHandler(model, data);
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

    useEffect(() => {
        void (async () => {
            try {
                const tabs = tabManager.getSorted();
                const showTabs: TabConfig[] = [];
                const hideTabs: TabConfig[] = [];
                for (const tab of tabs) {
                    if (tab.hide && await tab.hide()) {
                        hideTabs.push(tab);
                    } else {
                        showTabs.push(tab);
                    }
                }
                setShowTabs(showTabs);
                setHideTabs(hideTabs);
            } catch (err) {
                handleError(err);
            }
        })();
    }, [model])

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

    const TabComponent = tabManager.records[tabId]?.component;

    return (
        <Tabs value={tabId} onValueChange={setTabId}
              className={"flex flex-col h-full p-4"}>
            <div className="flex">
                <Button variant={'ghost'} size={'icon'} onClick={collapse}>
                    <FoldHorizontalIcon/>
                </Button>
                <TabsList className="overflow-x-auto scrollbar-none gap-1 justify-normal">
                    {showTabs.map((tab) => {
                        const Component = tab.label;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id}>
                                <Component/>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
                {hideTabs?.length && (<DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline">{t("default.more")}</Button>}/>
                    <DropdownMenuContent>
                        {hideTabs.map((tab) => {
                            const Component = tab.label;
                            return (
                                <DropdownMenuItem
                                    key={tab.id}
                                    onClick={() => setTabId(tab.id)}>
                                    <Component/>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>)}
            </div>
            <div className="flex flex-row-reverse gap-2">
                <DeleteDialog handleDelete={handleDelete}
                              itemName={`default.${moduleName}`}/>
                <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
                    <DialogTrigger render={<Tooltip/>}>
                        <TooltipTrigger onClick={() => setCloneOpen(true)}
                                        render={<Button variant={'secondary'}/>}>
                            <CopyIcon/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('default.copy')}</p>
                        </TooltipContent>
                    </DialogTrigger>
                    <DialogContent render={<form action={handleClone}/>}>
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
                            <Button type="submit">
                                {t("default.copy")}
                            </Button>
                            <DialogClose render={<Button variant="outline"/>}>
                                {t("default.cancel")}
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Tooltip>
                    <TooltipTrigger onClick={handleExport}
                                    render={<Button variant={'secondary'}/>}>
                        <FileUpIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('default.export')}</p>
                    </TooltipContent>
                </Tooltip>
                {toolbar?.(model)}
            </div>
            {TabComponent &&
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TabComponent/>
                </div>}
        </Tabs>
    );
}