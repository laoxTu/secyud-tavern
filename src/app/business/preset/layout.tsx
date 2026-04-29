'use client';

import {usePager} from "@/components/pager";
import {get, post} from "@/api/client"
import {PagedResult} from "@/models/common";
import {PresetModel} from "@/business/preset/models";
import {PaginationWrapper} from "@/components/pager/nodes/PaginationWrapper";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import React, {useCallback, useState} from "react";
import {useParams} from "next/navigation";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Field, FieldGroup} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useErrorHandler} from "@/components/message";
import {Item, ItemContent, ItemDescription, ItemGroup, ItemTitle} from "@/components/ui/item";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import Link from "next/link";
import {Skeleton} from "@/components/ui/skeleton";
import {PresetListContext, usePresetListContext} from "@/app/business/preset/Context";


function PresetCreateButtons() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const {refreshPresetList} = usePresetListContext();

    // 处理提交
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
            refreshPresetList();
        } catch (error) {
            handleError(error);
        }
    };

    // 处理文件导入
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
            refreshPresetList();
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
                            <DialogTitle>{t("preset.create")}</DialogTitle>
                            <DialogDescription>
                                {t("preset.create_description")}
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


export default function PresetLayout({
                                         children,
                                     }: Readonly<{
    children: React.ReactNode;
}>) {
    const params = useParams();
    const t = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const currentId = params.id as string;

    const pager = usePager({
        fetcher: async params => await get("/presets", {params}) as PagedResult<PresetModel>
    });

    const refresh = useCallback(async () => {
        await pager.refresh();
    }, [pager])

    return (
        <PresetListContext.Provider value={{refreshPresetList: refresh}}>
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize="320px"
                                minSize="300px">
                    {pager.pageCount === 0 && !pager.search && !pager.loading ?
                        <div className={"flex justify-center w-full"}>
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FolderOpenIcon/>
                                    </EmptyMedia>
                                    <EmptyTitle>{t("preset.empty_title")}</EmptyTitle>
                                    <EmptyDescription>
                                        {t("preset.empty_description")}
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent className="flex-row justify-center gap-2">
                                    <PresetCreateButtons/>
                                </EmptyContent>
                            </Empty>
                        </div> :
                        <div className="flex flex-col p-2 gap-1 h-full">
                            <div className="flex flex-row-reverse gap-2">
                                <PresetCreateButtons/>
                            </div>
                            <form action={p => pager.doSearch(p.get("search") as string)}>
                                <InputGroup>
                                    <InputGroupInput name="search" id="preset-list-search"
                                                     placeholder={t("default.search")}
                                                     value={searchInput}
                                                     onChange={(e) => setSearchInput(e.target.value)}/>
                                    <InputGroupAddon align={"inline-end"}>
                                        <InputGroupButton onClick={() => pager.doSearch(undefined)}>
                                            <XIcon/>
                                        </InputGroupButton>
                                        <InputGroupButton type="submit">
                                            <SearchIcon/>
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>
                            </form>
                            <div className="flex-1 h-full overflow-auto">
                                <ItemGroup className={"p-2 gap-3"}>
                                    {pager.data.map((p, index) => (
                                        <Item key={index}
                                              variant={p.id === currentId ? "muted" : "outline"}
                                              role="listitem" asChild>
                                            <Link href={`/business/preset/${p.id}`}>
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
                                            </Link>
                                        </Item>
                                    ))}
                                </ItemGroup>
                                {pager.loading && <div className="w-full">
                                    <Skeleton className="h-4 w-2/3"/>
                                    <Skeleton className="h-4 w-1/2"/>
                                    <Skeleton className="aspect-video w-full"/>
                                </div>}
                            </div>
                            <PaginationWrapper defaultPageIndex={pager.pageIndex}
                                               onPageIndexChanged={pager.changePageIndex}
                                               pageCount={pager.pageCount}/>
                        </div>
                    }
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel minSize="480px">
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </PresetListContext.Provider>
    );
}