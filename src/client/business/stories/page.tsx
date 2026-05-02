// src/client/business/stories/page/tsx
'use client';

import React, {useCallback, useMemo, useState} from "react";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {FileTextIcon, FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {StoryContext, storyTabManager, useStoryContext} from ".";
import {del, get, post} from "@/client";
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
import {usePager} from "@/client/components/pager";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@/components/ui/item";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {useErrorHandler} from "@/client/errors";
import {TabConfig} from "@/client/components/tab";
import {StoryModel} from "@/shared/business/stories";
import {PagedResult} from "@/shared/models";
import {PaginationWrapper} from "@/client/components/pager/component";


const tabConfigId = "story";

function Navigation() {
    const t = useTranslations();
    return (
        <>
            {t(`default.${tabConfigId}`)}
        </>
    );
}

function Content() {
    const t = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const [key, setKey] = useState(0);
    const [story, setStory] = useState<StoryModel | undefined>();
    const {data, search, loading, pageCount, pageIndex, changePageIndex, refresh, doSearch} = usePager({
        fetcher: async params => await get("/stories", {params}) as PagedResult<StoryModel>
    });
    const {handleError} = useErrorHandler();

    const refreshStoryList = useCallback(async () => {
        await refresh();
    }, [refresh])

    const changeStory = useCallback(async (id: string) => {
        try {
            const res = await get('/stories/{id}', {
                method: 'GET',
                params: {id}
            }) as StoryModel;
            setStory(res);
            setKey(u => u + 1)
        } catch (err) {
            handleError(err as Error);
        }
    }, [handleError]);

    const selectStory = useCallback(async (id: string) => {
        if (id !== story?.id) {
            await changeStory(id);
        }
    }, [story, changeStory]);

    const refreshStory = useCallback(async () => {
        if (story)
            await changeStory(story.id);
    }, [story, changeStory]);

    return (
        <StoryContext.Provider
            value={{story: story, setStory: setStory, refreshStory: refreshStory, refreshStoryList: refreshStoryList}}>
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
                                    <EmptyTitle>{t("default.empty_title", {target: t("default.story")})}</EmptyTitle>
                                    <EmptyDescription>
                                        {t("default.empty_description", {target: t("default.story")})}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent className="flex-row justify-center gap-2">
                                    <CreateButtons/>
                                </EmptyContent>
                            </Empty>
                        </div> :
                        <div className="flex flex-col p-2 gap-2 h-full">
                            <div className="flex p-2 gap-2">
                                <form action={p => doSearch(p.get("search") as string)}
                                      className={"flex-1"}>
                                    <InputGroup>
                                        <InputGroupInput name="search" id="story-list-search"
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
                                <CreateButtons/>
                            </div>
                            <div className="flex-1 h-full overflow-auto">
                                <ItemGroup className={"p-2 gap-3"}>
                                    {data && data.map((p, index) => (
                                        <Item key={index} asChild
                                              variant={p.id === story?.id ? "muted" : "outline"}
                                              role="listitem" onClick={() => selectStory(p.id)}>
                                            <a>
                                                <ItemContent>
                                                    <ItemTitle className="line-clamp-1">
                                                        {p.name}
                                                    </ItemTitle>
                                                    <ItemDescription>{p.content.author}</ItemDescription>
                                                </ItemContent>
                                                <ItemContent className="flex-none text-center">
                                                    <ItemDescription>{p.id}</ItemDescription>
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
                <ResizablePanel minSize="560px">
                    <StoryContent key={key}/>
                </ResizablePanel>
            </ResizablePanelGroup>
        </StoryContext.Provider>
    );
}

function StoryContent() {
    const [copyOpen, setCopyOpen] = useState(false);
    const {story, setStory, refreshStoryList} = useStoryContext();
    const {handleError} = useErrorHandler();
    const t = useTranslations();

    const tabs = useMemo(() => storyTabManager.getSorted(), [])
    const firstTab = storyTabManager.getFirstTab();

    const handleExport = useCallback(async () => {
        try {
            if (!story) return;
            window.open(`/api/stories/${story.id}/export`)
        } catch (err) {
            handleError(err);
        }
    }, [handleError, story]);
    const handleCopySubmit = async (data: FormData) => {
        try {
            if (!story) return;
            const params: StoryModel = {
                ...story,
                id: "",
                name: data.get("name") as string,
            };
            await post("/stories", params);
            setCopyOpen(false);
            await refreshStoryList();
        } catch (error) {
            handleError(error);
        }
    };
    const handleDelete = useCallback(async () => {
        try {
            await del('/stories/{id}', {
                method: 'DELETE',
                params: {id: story!.id}
            })
            setStory(undefined);
            await refreshStoryList();
        } catch (err) {
            handleError(err);
        }
    }, [handleError, story, refreshStoryList, setStory])

    return story ? (
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
                                    <DialogTitle>{t("story.copy")}</DialogTitle>
                                    <DialogDescription>
                                        {t("story.copy_description")}
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup>
                                    <Field>
                                        <Label htmlFor={`code-story-copy`}>{t("default.code") + "*"}</Label>
                                        <Input id={`code-story-copy`} name="code"
                                               required/>
                                    </Field>
                                    <Field>
                                        <Label htmlFor={`name-story-copy`}>{t("default.name") + "*"}</Label>
                                        <Input id={`name-story-copy`} name="name"
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
                                <AlertDialogTitle>{t("default.delete_title", {target: t("default.story")})}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("default.delete_description", {target: t("default.story")})}
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
                    <EmptyTitle>{t("default.select_title", {target: t("default.story")})}</EmptyTitle>
                    <EmptyDescription>
                        {t("default.select_description", {target: t("default.story")})}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    );
}

function CreateButtons() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const {refreshStoryList} = useStoryContext();

    const handleCreateSubmit = async (data: FormData) => {
        try {
            const params: StoryModel = {
                content: {},
                id: "",
                name: data.get("name") as string,
                requires: [],
            };
            await post("/stories", params);
            setCreateOpen(false);
            await refreshStoryList();
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
            await post("/stories", jsonData, {
                params: {
                    isImport: true
                }
            });
            setImportOpen(false);
            await refreshStoryList();
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
                            <DialogTitle>{t("default.create_title", {target: t("default.story")})}</DialogTitle>
                            <DialogDescription>
                                {t("default.create_description", {target: t("default.story")})}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor={`story-name`}>{t("default.name") + "*"}</Label>
                                <Input id={`story-name`} name="name"
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
                            <DialogTitle>{t("default.import_title", {target: t("default.story")})}</DialogTitle>
                            <DialogDescription>
                                {t("default.import_description", {target: t("default.story")})}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor={`story-filename`}>{t("default.name")}</Label>
                                <Input
                                    id={`story-filename`}
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

export const tabConfig: TabConfig = {
    id: tabConfigId,
    label: Navigation,
    component: Content
} as const;
