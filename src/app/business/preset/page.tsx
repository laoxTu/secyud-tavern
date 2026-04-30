// src/app/
'use client';

import React, {useCallback, useMemo, useState} from "react";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {FileTextIcon, FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {PresetModel} from "@/business/preset/models";
import {useErrorHandler} from "@/components/message";
import {PresetContext, presetTabManager, usePresetContext} from ".";
import {del, get, post} from "@/api/client";
import {Skeleton} from "@/components/ui/skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {usePager} from "@/components/pager";
import {PagedResult} from "@/models/common";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {PaginationWrapper} from "@/components/pager/nodes/PaginationWrapper";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@/components/ui/item";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";

function PresetContent() {
    const [copyOpen, setCopyOpen] = useState(false);
    const {preset, setPreset, refreshPresetList} = usePresetContext();
    const {handleError} = useErrorHandler();
    const t = useTranslations();

    const tabs = useMemo(() => presetTabManager.getSorted(), [])
    const firstTab = presetTabManager.getFirstTab();

    const handleExport = useCallback(async () => {
        try {
            if (!preset) return;
            window.open(`/api/presets/${preset.id}/export`)
        } catch (err) {
            handleError(err);
        }
    }, [handleError, preset]);
    const handleCopySubmit = async (data: FormData) => {
        try {
            if (!preset) return;
            const code = data.get("code") as string;
            const name = data.get("name") as string;
            const params: PresetModel = {
                ...preset,
                id: "",
                code: code,
                name: name,
            };
            await post("/presets", params);
            setCopyOpen(false);
            await refreshPresetList();
        } catch (error) {
            handleError(error);
        }
    };
    const handleDelete = useCallback(async () => {
        try {
            await del('/presets/{id}', {
                method: 'DELETE',
                params: {id: preset!.id}
            })
            setPreset(undefined);
            await refreshPresetList();
        } catch (err) {
            handleError(err);
        }
    }, [handleError, preset, refreshPresetList, setPreset])

    return preset ? (
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
                    <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
                        <Button onClick={handleExport}>{t("default.export")}</Button>
                        <DialogTrigger asChild>
                            <Button variant="secondary">{t("default.copy")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleCopySubmit}
                                  className="form-reset">
                                <DialogHeader>
                                    <DialogTitle>{t("preset.copy")}</DialogTitle>
                                    <DialogDescription>
                                        {t("preset.copy_description")}
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup>
                                    <Field>
                                        <Label htmlFor={`code-preset-copy`}>{t("default.code") + "*"}</Label>
                                        <Input id={`code-preset-copy`} name="code"
                                               required/>
                                    </Field>
                                    <Field>
                                        <Label htmlFor={`name-preset-copy`}>{t("default.name") + "*"}</Label>
                                        <Input id={`name-preset-copy`} name="name"
                                               required/>
                                    </Field>
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
                                <AlertDialogTitle>{t("default.delete_title", {target: t("default.preset")})}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("default.delete_description", {target: t("default.preset")})}
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
                </div>
            </div>
            {tabs.map((tab, index) => {
                const Component = tab.component;
                if (!Component) return null;
                return (
                    <TabsContent key={index} value={tab.id}
                                 className="flex-1 overflow-hidden">
                        <Component/>
                    </TabsContent>
                );
            })}
        </Tabs>
    ) : (
        <div className={"flex h-full"}>
            <Empty className={"m-auto"}>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileTextIcon/>
                    </EmptyMedia>
                    <EmptyTitle>{t("preset.select_title")}</EmptyTitle>
                    <EmptyDescription>
                        {t("preset.select_description")}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    );
}

function PresetCreateButtons() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const {refreshPresetList} = usePresetContext();

    const handleCreateSubmit = async (data: FormData) => {
        try {
            const params: PresetModel = {
                content: {
                    "author": "",
                    "description": ""
                },
                id: "",
                version: "1.0.0",
                code: data.get("code") as string,
                name: data.get("name") as string,
                requires: [],
                tags: [],
            };
            await post("/presets", params);
            setCreateOpen(false);
            await refreshPresetList();
        } catch (error) {
            handleError(error);
        }
    };
    const handleImportSubmit = async (formData: FormData) => {
        try {
            const file = formData.get("filename") as File;
            if (!file) return;
            const text = await file.text();
            const jsonData = JSON.parse(text);
            await post("/presets", jsonData, {
                params: {
                    isImport: true
                }
            });
            setImportOpen(false);
            await refreshPresetList();
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
                    <form action={handleCreateSubmit}
                          className="form-reset">
                        <DialogHeader>
                            <DialogTitle>{t("default.create_title", {target: t("default.preset")})}</DialogTitle>
                            <DialogDescription>
                                {t("default.create_description", {target: t("default.preset")})}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor={`preset-code`}>{t("default.code") + "*"}</Label>
                                <Input id={`preset-code`} name="code"
                                       required/>
                            </Field>
                            <Field>
                                <Label htmlFor={`preset-name`}>{t("default.name") + "*"}</Label>
                                <Input id={`preset-name`} name="name"
                                       required/>
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
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">{t("default.import")}</Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleImportSubmit}
                          className="form-reset">
                        <DialogHeader>
                            <DialogTitle>{t("preset.import")}</DialogTitle>
                            <DialogDescription>
                                {t("preset.import_description")}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor={`preset-filename`}>{t("default.name")}</Label>
                                <Input
                                    id={`preset-filename`}
                                    name="filename"
                                    type="file"
                                    accept=".json"
                                    required/>
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

export default function PresetLayout() {
    const t = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const [key, setKey] = useState(0);
    const [preset, setPreset] = useState<PresetModel | undefined>();
    const {data, search, loading, pageCount, pageIndex, changePageIndex, refresh, doSearch} = usePager({
        fetcher: async params => await get("/presets", {params}) as PagedResult<PresetModel>
    });
    const {handleError} = useErrorHandler();

    const refreshPresetList = useCallback(async () => {
        await refresh();
    }, [refresh])

    const selectPreset = useCallback(async (id: string) => {
        try {
            const res = await get('/presets/{id}', {
                method: 'GET',
                params: {id}
            }) as PresetModel;
            setPreset(res);
            setKey(u => u + 1)
        } catch (err) {
            handleError(err as Error);
        }
    }, [handleError]);

    const refreshPreset = useCallback(async () => {
        if (preset)
            await selectPreset(preset.id);
    }, [preset, selectPreset]);

    return (
        <PresetContext.Provider value={{preset, setPreset, refreshPreset, refreshPresetList}}>
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize="320px"
                                minSize="300px">
                    {pageCount === 0 && !search && !loading ?
                        <div className={"flex h-full pb-24"}>
                            <Empty className={"m-auto"}>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FolderOpenIcon/>
                                    </EmptyMedia>
                                    <EmptyTitle>{t("default.empty_title", {target: t("default.preset")})}</EmptyTitle>
                                    <EmptyDescription>
                                        {t("default.empty_description", {target: t("default.preset")})}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent className="flex-row justify-center gap-2">
                                    <PresetCreateButtons/>
                                </EmptyContent>
                            </Empty>
                        </div> :
                        <div className="flex flex-col p-2 gap-2 h-full">
                            <div className="flex p-2 gap-2">
                                <form action={p => doSearch(p.get("search") as string)}
                                      className={"flex-1"}>
                                    <InputGroup>
                                        <InputGroupInput name="search" id="preset-list-search"
                                                         placeholder={t("default.search")}
                                                         value={searchInput}
                                                         onChange={(e) => setSearchInput(e.target.value)}/>
                                        <InputGroupAddon align={"inline-end"}>
                                            <InputGroupButton onClick={() => {
                                                doSearch("");
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
                                <PresetCreateButtons/>
                            </div>
                            <div className="flex-1 h-full overflow-auto">
                                <ItemGroup className={"p-2 gap-3"}>
                                    {data.map((p, index) => (
                                        <Item key={index} asChild
                                              variant={p.id === preset?.id ? "muted" : "outline"}
                                              role="listitem" onClick={() => selectPreset(p.id)}>
                                            <a>
                                                <ItemContent>
                                                    <ItemTitle className="line-clamp-1">
                                                        {p.name} - {" "}
                                                        <span className="text-muted-foreground">{p.code}</span>
                                                    </ItemTitle>
                                                    <ItemDescription>{p.content.author}</ItemDescription>
                                                </ItemContent>
                                                <ItemContent className="flex-none text-center">
                                                    <ItemDescription>{p.version}</ItemDescription>
                                                </ItemContent>
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
                <ResizablePanel minSize="480px">
                    <PresetContent key={key}/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </PresetContext.Provider>
    );
}