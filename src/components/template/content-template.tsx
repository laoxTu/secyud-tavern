'use client';
import React, {Context, useCallback, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {FileTextIcon, FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction,
    AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Empty, EmptyContent,
    EmptyDescription, EmptyHeader,
    EmptyMedia, EmptyTitle
} from "@/components/ui/empty";
import {
    InputGroup, InputGroupAddon,
    InputGroupButton, InputGroupInput
} from "@/components/ui/input-group";
import {
    ResizableHandle, ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import {
    Tabs, TabsContent,
    TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {Item, ItemGroup} from "@/components/ui/item";
import {Field, FieldGroup} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {PaginationWrapper, usePager} from "@/components/custom/pager";
import {TabManager} from "@/components/custom/tab";
import {useErrorHandler} from "@/handler/client/error";
import {del, get, post} from "@/client";
import {PagedResult, PageOptions, BaseModel} from "@/business/models";
import {ModelContextType, useModelContext} from "./models";
import {toast} from "sonner";

export interface ModelListProps<TModel extends BaseModel> {
    modelType: string,
    modelApi: string,
    contextType: Context<ModelContextType<TModel> | undefined>,
    getListHandler?: (pageOption: PageOptions) => Promise<PagedResult<TModel>>,
    getHandler?: (id: string) => Promise<TModel | undefined>,
    searchAccessor?: (data: FormData) => any,
    searchContent?: () => React.ReactNode,
    modelContent: (model: TModel) => React.ReactNode,
    cloneHandler: (model: TModel, data: FormData) => Promise<void>,
    cloneContent: (model: TModel) => React.ReactNode,
    exportHandler?: (model: TModel) => Promise<void>,
    deleteHandler?: (model: TModel) => Promise<void>,
    createHandler: (data: FormData) => Promise<void>,
    createContent: () => React.ReactNode,
    importHandler?: (file: File) => Promise<void>,
    importAccept?: string,
    tabManagerAccessor: () => TabManager
}

export function ModelListContentTemplate<TModel extends BaseModel>(
    {
        modelType,
        modelApi,
        contextType,
        getListHandler,
        getHandler,
        searchAccessor,
        searchContent,
        modelContent,
        cloneContent,
        exportHandler,
        cloneHandler,
        deleteHandler,
        createContent,
        createHandler,
        importHandler,
        importAccept,
        tabManagerAccessor
    }: ModelListProps<TModel>) {

    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [searchInput, setSearchInput] = useState('');
    const [model, setModel] = useState<TModel | undefined>();
    const [contentKey, setContentKey] = useState(0);
    const {data, search, loading, pageCount, pageIndex, changePageIndex, refresh, doSearch} = usePager({
        fetcher: getListHandler ?? (async (options: PageOptions) =>
            // @ts-expect-error dynamic api required
            await get(`/${modelApi}`, {params: options}) as PagedResult<TModel>),
        defaultPageSize: 10,
        defaultSearch: {},
    });

    const refreshModelList = useCallback(async () => {
        await refresh();
    }, [refresh])


    const changeModel = useCallback(async (id: string) => {
        try {
            const model = getHandler ?
                await getHandler(id) :
                // @ts-expect-error dynamic api required
                await get(`/${modelApi}/{id}`, {params: {id}}) as TModel;
            setModel(model);
            setContentKey(u => u + 1);
            await refreshModelList();
        } catch (err) {
            handleError(err as Error);
        }
    }, [getHandler, handleError, modelApi]);

    const selectModel = useCallback(async (id: string) => {
        if (id !== model?.id) {
            await changeModel(id);
        }
    }, [model, changeModel]);

    const refreshModel = useCallback(async () => {
        if (model)
            await changeModel(model.id);
    }, [model, changeModel]);

    const searchModels = useCallback((data: FormData) => {
        doSearch({
            fuzzy: data.get("search") as string,
            ...searchAccessor?.(data) ?? {}
        });
    }, [doSearch, searchAccessor])

    importAccept ??= '.json';

    return (
        <contextType.Provider
            value={{
                model: model,
                setModel: setModel,
                refreshModel: refreshModel,
                refreshModelList: refreshModelList
            }}>
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize="320px"
                                minSize="300px">
                    {pageCount === 0 && !search?.fuzzy && !loading ?
                        <div className={"flex h-full pb-24"}>
                            <Empty className={"m-auto"}>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FolderOpenIcon/>
                                    </EmptyMedia>
                                    <EmptyTitle>{t("default.empty_title", {target: t(`default.${modelType}`)})}</EmptyTitle>
                                    <EmptyDescription>
                                        {t("default.empty_description", {target: t(`default.${modelType}`)})}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent className="flex-row justify-center gap-2">
                                    <CreateButtons modelType={modelType} modelApi={modelType} contextType={contextType}
                                                   createHandler={createHandler} createContent={createContent}
                                                   importHandler={importHandler} importAccept={importAccept}/>
                                </EmptyContent>
                            </Empty>
                        </div> :
                        <div className="flex flex-col p-2 gap-2 h-full">
                            <div className="flex p-2 gap-2">
                                <form action={searchModels} className={"flex-1"}>
                                    {searchContent?.()}
                                    <InputGroup>
                                        <InputGroupInput name="search" id={`${modelType}-list-search`}
                                                         placeholder={t("default.search")}
                                                         value={searchInput}
                                                         onChange={(e) => setSearchInput(e.target.value)}/>
                                        <InputGroupAddon align={"inline-end"}>
                                            <InputGroupButton onClick={() => {
                                                doSearch({
                                                    ...search ?? {},
                                                    fuzzy: ""
                                                });
                                                setSearchInput("");
                                            }}>
                                                <XIcon/>
                                            </InputGroupButton>
                                            <InputGroupButton type="submit">
                                                <SearchIcon/>
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </form>
                                <CreateButtons modelType={modelType} modelApi={modelType} contextType={contextType}
                                               createHandler={createHandler} createContent={createContent}
                                               importHandler={importHandler} importAccept={importAccept}/>
                            </div>
                            <div className="flex-1 h-full overflow-auto">
                                <ItemGroup className={"p-2 gap-3"}>
                                    {data && data.map((t, index) => (
                                        <Item key={index} asChild
                                              className={t.id === model?.id ? "bg-gray-100" : ""}
                                              variant={"outline"}
                                              role="listitem" onClick={() => selectModel(t.id)}>
                                            <a className={'cursor-pointer'}>
                                                {modelContent(t)}
                                            </a>
                                        </Item>
                                    ))}
                                </ItemGroup>
                                {loading && <div className="w-full">
                                    <Skeleton className="h-4 w-2/3"/>
                                    <Skeleton className="h-4 w-1/2"/>
                                    <Skeleton className="aspect-video w-full"/>
                                </div>}
                            </div>
                            <PaginationWrapper defaultPageIndex={pageIndex}
                                               onPageIndexChanged={changePageIndex}
                                               pageCount={pageCount}/>
                        </div>
                    }
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel minSize="560px">
                    {model ?
                        <ModelContent<TModel> key={contentKey}
                                              modelType={modelType} modelApi={modelApi} contextType={contextType}
                                              cloneHandler={cloneHandler} cloneContent={cloneContent}
                                              exportHandler={exportHandler} deleteHandler={deleteHandler}
                                              tabManagerAccessor={tabManagerAccessor}/> :
                        <div className={"flex h-full pb-24"}>
                            <Empty className={"m-auto"}>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FileTextIcon/>
                                    </EmptyMedia>
                                    <EmptyTitle>{t("default.select_title", {target: t(`default.${modelType}`)})}</EmptyTitle>
                                    <EmptyDescription>
                                        {t("default.select_description", {target: t(`default.${modelType}`)})}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>}
                </ResizablePanel>
            </ResizablePanelGroup>
        </contextType.Provider>
    );
}

function ModelContent<TModel extends BaseModel>(
    {modelType, modelApi, contextType, cloneContent, exportHandler, cloneHandler, deleteHandler, tabManagerAccessor}: {
        modelType: string,
        modelApi: string,
        contextType: Context<ModelContextType<TModel> | undefined>,
        cloneContent: (model: TModel) => React.ReactNode,
        exportHandler?: (model: TModel) => Promise<void>,
        cloneHandler: (model: TModel, data: FormData) => Promise<void>,
        deleteHandler?: (model: TModel) => Promise<void>,
        tabManagerAccessor: () => TabManager
    }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [copyOpen, setCloneOpen] = useState(false);
    const {model, setModel, refreshModelList} = useModelContext<TModel>(contextType, modelType, t);
    if (!model) {
        throw new Error('model is not available at this time');
    }

    const tabManager = useMemo(() => tabManagerAccessor(), [tabManagerAccessor]);
    const tabs = tabManager.getSorted();
    const firstTab = tabManager.getFirstTab();

    const handleExport = useCallback(async () => {
        try {
            if (exportHandler) {
                await exportHandler(model);
            } else {
                window.open(`/api/${modelApi}/${model.id}/export`)
            }
        } catch (err) {
            handleError(err);
        }
    }, [exportHandler, handleError, model, modelApi]);
    const handleClone = async (data: FormData) => {
        try {
            await cloneHandler({...model, id: ""}, data);
            await refreshModelList();
            setCloneOpen(false);
        } catch (error) {
            handleError(error);
        }
    };
    const handleDelete = useCallback(async () => {
        try {
            if (deleteHandler) {
                await deleteHandler(model);
            } else {
                // @ts-expect-error dynamic api required
                await del(`/${modelApi}/{id}`, {params: {id: model.id}});
            }
            setModel(undefined);
            await refreshModelList();
        } catch (err) {
            handleError(err);
        }
    }, [deleteHandler, handleError, model, modelApi, refreshModelList, setModel])

    return (
        <Tabs defaultValue={firstTab?.id}
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
                    <Dialog open={copyOpen} onOpenChange={setCloneOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">{t("default.copy")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleClone}
                                  className="form-reset">
                                <DialogHeader>
                                    <DialogTitle>
                                        {t("default.copy_title", {target: t(`default.${modelType}`)})}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t("default.copy_description", {target: t(`default.${modelType}`)})}
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
                                    {t("default.delete_title", {target: t(`default.${modelType}`)})}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("default.delete_description", {target: t(`default.${modelType}`)})}
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
            {tabs.map((tab, index) => {
                const Component = tab.component;
                if (!Component) return null;
                return (
                    <TabsContent key={index} value={tab.id} className="flex-1 overflow-hidden">
                        <Component/>
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}

function CreateButtons<TModel extends BaseModel>(
    {modelType, modelApi, contextType, createContent, createHandler, importHandler, importAccept = '.json'}: {
        modelType: string,
        modelApi: string,
        contextType: Context<ModelContextType<TModel> | undefined>,
        createContent: () => React.ReactNode,
        createHandler: (data: FormData) => Promise<void>,
        importHandler?: (file: File) => Promise<void>,
        importAccept: string,
    }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const {refreshModelList} = useModelContext<TModel>(contextType, modelType, t);

    const handleCreate = async (data: FormData) => {
        try {
            await createHandler(data);
            await refreshModelList();
            setCreateOpen(false);
            toast.success(t("default.created_successfully"), {
                richColors: true
            });
        } catch (error) {
            handleError(error);
        }
    };

    const handleImport = async (formData: FormData) => {
        try {
            const file = formData.get("filename") as File;
            if (importHandler)
                await importHandler(file);
            else {
                const text = await file.text();
                const json = JSON.parse(text);
                // @ts-expect-error dynamic api required
                await post(`/${modelApi}`, json, {params: {isImport: true}})
            }
            await refreshModelList();
            setImportOpen(false);
            toast.success(t("default.imported_successfully"), {
                richColors: true
            });
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                    <Button>{t("default.create")}</Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleCreate} className="form-reset">
                        <DialogHeader>
                            <DialogTitle>
                                {t("default.create_title", {target: t(`default.${modelType}`)})}
                            </DialogTitle>
                            <DialogDescription>
                                {t("default.create_description", {target: t(`default.${modelType}`)})}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            {createContent()}
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t("default.cancel")}</Button>
                            </DialogClose>
                            <Button type="submit">{t("default.create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">{t("default.import")}</Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleImport}
                          className="form-reset">
                        <DialogHeader>
                            <DialogTitle>
                                {t("default.import_title", {target: t(`default.${modelType}`)})}
                            </DialogTitle>
                            <DialogDescription>
                                {t("default.import_description", {target: t(`default.${modelType}`)})}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor={`${modelType}-filename`}>{t("default.name")}</Label>
                                <Input id={`${modelType}-filename`} name="filename" type="file"
                                       accept={importAccept} required/>
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t("default.cancel")}</Button>
                            </DialogClose>
                            <Button type="submit">{t("default.import")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
