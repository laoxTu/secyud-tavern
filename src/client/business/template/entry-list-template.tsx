import {useTranslations} from "next-intl";
import {ChevronsDownIcon, ChevronsUpIcon, FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import React, {Context, useCallback, useState} from "react";
import {toast} from "sonner";
import {Field, FieldGroup, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Card, CardContent} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Switch} from "@/components/ui/switch";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty";
import {
    InputGroup, InputGroupAddon,
    InputGroupButton, InputGroupInput
} from "@/components/ui/input-group";
import {PagedResult} from "@/shared/models";
import {BaseModel} from "@/shared/business";
import {del, get, post, put} from "@/client";
import {useErrorHandler} from "@/client/errors";
import {usePager} from "@/client/components/pager";
import {PaginationWrapper} from "@/client/components/pager/component";
import {ModelContextType, useModelContext} from "@/client/business/template/context";


export interface ModelListProps<TModel extends BaseModel> {
    modelType: string,
    modelApi: string,
    entryType: string,
    contextType: Context<ModelContextType<TModel> | undefined>,
    createAccessor: () => any,
    updateAccessor: (data: FormData) => any,
    updateContent: (entry: any) => React.ReactNode,
}

export function EntryListTemplate<TModel extends BaseModel>(
    {
        modelType,
        modelApi,
        entryType,
        contextType,
        createAccessor,
        updateAccessor,
        updateContent,
    }: ModelListProps<TModel>) {
    const t = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const {model} = useModelContext<TModel>(contextType, modelType, t);
    if (!model) {
        throw new Error('model is not available at this time');
    }

    const pager = usePager({
        // @ts-expect-error dynamic api required
        fetcher: async params => await get(`/${modelApi}/{id}/entries/{entryType}`,
            {
                params: {
                    ...params,
                    "id": model.id,
                    "entryType": entryType,
                }
            }) as PagedResult<any>,
        defaultPageSize: 5
    });

    const refreshList = useCallback(async () => {
        await pager.refresh();
    }, [pager])

    const searchEntries = useCallback((data: FormData) => {
        pager.doSearch(data.get("search") as string);
    }, [pager])

    return (
        <div className={"flex w-full h-full"}>
            {pager.pageCount === 0 && !pager.search && !pager.loading ?
                <div className={"flex flex-1 h-full pb-24"}>
                    <Empty className={"m-auto"}>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FolderOpenIcon/>
                            </EmptyMedia>
                            <EmptyTitle>{t("default.empty_title", {target: t(`${modelType}.${entryType}`)})}</EmptyTitle>
                            <EmptyDescription>
                                {t("default.empty_description", {target: t(`${modelType}.${entryType}`)})}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <CreateButtons modelType={modelType} modelApi={modelApi} entryType={entryType}
                                           contextType={contextType} createAccessor={createAccessor}
                                           refreshList={refreshList}/>
                        </EmptyContent>
                    </Empty>
                </div> :
                <div className={"flex-1 flex flex-col p-2 gap-1"}>
                    <div className="flex gap-2 flex-row p-2">
                        <form action={searchEntries} className={"flex-1"}>
                            <InputGroup>
                                <InputGroupInput name="search" id={`${modelType}-list-search`}
                                                 placeholder={t("default.search")}
                                                 value={searchInput}
                                                 onChange={(e) => setSearchInput(e.target.value)}/>
                                <InputGroupAddon align={"inline-end"}>
                                    <InputGroupButton onClick={() => {
                                        pager.doSearch("");
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
                        <CreateButtons modelType={modelType} modelApi={modelApi} entryType={entryType}
                                       contextType={contextType} createAccessor={createAccessor}
                                       refreshList={refreshList}/>
                    </div>
                    <div className="flex-1 overflow-auto space-y-2 p-2">
                        {pager.data.map((data, i) =>
                            <Editor key={i} entry={data} refreshList={() => pager.refresh()}
                                    modelType={modelType} modelApi={modelApi} entryType={entryType}
                                    contextType={contextType}
                                    updateAccessor={updateAccessor} updateContent={updateContent}/>
                        )}
                    </div>
                    <div className="w-full p-1">
                        <PaginationWrapper defaultPageIndex={pager.pageIndex}
                                           onPageIndexChanged={pager.changePageIndex}
                                           pageCount={pager.pageCount}/>
                    </div>
                </div>
            }
        </div>
    );
}

function CreateButtons<TModel extends BaseModel>(
    {
        modelType,
        modelApi,
        entryType,
        contextType,
        createAccessor,
        refreshList,
    }: {
        modelType: string,
        modelApi: string,
        entryType: string,
        contextType: Context<ModelContextType<TModel> | undefined>,
        createAccessor: () => any
        refreshList: () => Promise<void>
    }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const {model} = useModelContext<TModel>(contextType, modelType, t);
    if (!model) {
        throw new Error('model is not available at this time');
    }

    const handleCreate = async (data: FormData) => {
        try {
            // @ts-expect-error dynamic api required
            await post(`/${modelApi}/{id}/entries/{entryType}`, {
                name: data.get("name") as string,
                ...createAccessor()
            }, {
                params: {
                    "id": model.id,
                    "entryType": entryType,
                }
            });
            await refreshList();
            setCreateOpen(false);
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
                <Button>{t("default.create")}</Button>
            </DialogTrigger>
            <DialogContent>
                <form action={handleCreate}
                      className="form-reset">
                    <DialogHeader>
                        <DialogTitle>
                            {t("default.create_title", {target: t(`${modelType}.${entryType}`)})}
                        </DialogTitle>
                        <DialogDescription>
                            {t("default.create_description", {target: t(`${modelType}.${entryType}`)})}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor={`${entryType}-name`}>{t("default.name") + "*"}</Label>
                            <Input id={`${entryType}-name`} name="name" required/>
                        </Field>
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
    );
}

function Editor<TModel extends BaseModel>(
    {
        modelType,
        modelApi,
        entryType,
        contextType,
        updateAccessor,
        updateContent,
        entry,
        refreshList,
    }: {
        modelType: string,
        modelApi: string,
        entryType: string,
        contextType: Context<ModelContextType<TModel> | undefined>,
        updateAccessor: (data: FormData) => any,
        updateContent: (entry: any) => React.ReactNode,
        entry: any,
        refreshList: () => Promise<void>,
    }) {

    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [isOpen, setIsOpen] = React.useState(true);
    const {model} = useModelContext<TModel>(contextType, modelType, t);
    if (!model) {
        throw new Error('model is not available at this time');
    }
    const handleUpdate = async (data: FormData) => {
        try {
            // @ts-expect-error dynamic api required
            await put(`/${modelApi}/{id}/entries/{entryType}/{entryId}`, {
                name: data.get("name") as string,
                ...updateAccessor(data)
            }, {
                params: {
                    "id": model.id,
                    "entryId": entry.id,
                    "entryType": entryType
                }
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshList();
        } catch (error) {
            handleError(error);
        }
    };
    const handleClone = async () => {
        try {
            // @ts-expect-error dynamic api required
            await post(`/${modelApi}/{id}/entries/{entryType}`, entry, {
                params: {
                    "id": model.id,
                    "entryType": entryType
                }
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshList();
        } catch (error) {
            handleError(error);
        }
    };
    const handleDelete = async () => {
        try {
            // @ts-expect-error dynamic api required
            await del(`/${modelApi}/{id}/entries/{entryType}/{entryId}`, {
                params: {
                    "id": model.id,
                    "entryId": entry.id,
                    "entryType": entryType
                }
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshList();
        } catch (error) {
            handleError(error);
        }
    };
    const handleSetDisable = useCallback(async (enabled: boolean) => {
        try {
            // @ts-expect-error dynamic api required
            await put(`/${modelApi}/{id}/entries/{entryType}/{entryId}/disabled`, {}, {
                params: {
                    "id": model.id,
                    "entryId": entry.id,
                    "entryType": entryType,
                    "disabled": !enabled
                }
            });
            toast.success(t(enabled ? "default.enable_item" : "default.disable_item"), {
                richColors: true
            });
            await refreshList();
        } catch (error) {
            handleError(error);
        }
    }, [entry.id, entryType, handleError, model.id, modelApi, refreshList, t]);


    return (
        <Card className={"w-full"}>
            <CardContent>
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className={"flex w-full gap-4 p-1 rounded-md hover:bg-gray-100"}>
                        <CollapsibleTrigger asChild>
                            <label className={"w-full m-auto px-2"}>
                                {entry.name}
                            </label>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-2"
                             onClick={(e) => e.stopPropagation()}>
                            <Switch id={`${entryType}-disabled-${entry.id}`}
                                    defaultChecked={!entry.disabled}
                                    onCheckedChange={handleSetDisable}/>
                            <Label className={"min-w-12"}
                                   htmlFor={`${entryType}-disabled-${entry.id}`}>
                                {t("default.enabled")}
                            </Label>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">{t("default.copy")}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {t("default.copy_title", {target: t(`default.${modelType}`)})}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("default.copy_description", {target: t(`default.${modelType}`)})}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t("default.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                                       onClick={handleClone}>
                                        {t("default.copy")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">{t("default.delete")}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t("default.delete_title", {target: t(`${modelType}.${entryType}`)})}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("default.delete_description", {target: t(`${modelType}.${entryType}`)})}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t("default.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction variant={"destructive"}
                                                       onClick={handleDelete}>
                                        {t("default.delete")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <CollapsibleTrigger asChild>
                            <Button size={"icon"} variant={"ghost"}>
                                {isOpen ? <ChevronsUpIcon/> : <ChevronsDownIcon/>}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent asChild className={"p-1"}>
                        <form action={handleUpdate}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        {updateContent(entry)}
                                    </FieldGroup>
                                </FieldSet>
                                <Field orientation="horizontal">
                                    <Button type="submit">{t("default.save")}</Button>
                                    <Button type="button" variant={"outline"}
                                            onClick={refreshList}>
                                        {t("default.reset")}
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
