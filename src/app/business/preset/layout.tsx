'use client';

import {usePager} from "@/components/pager";
import {get, post} from "@/api/client"
import {PagedResult} from "@/models/common";
import {PresetModel} from "@/business/preset/models";
import {PaginationWrapper} from "@/components/pager/nodes/PaginationWrapper";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import {FolderOpenIcon, ArrowUpRightIcon, SearchIcon, XIcon} from "lucide-react";
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


function PresetCreateButtons({idSuffix}: { idSuffix: string; }) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const {refreshPresetList} = usePresetListContext();

    // 处理提交
    const handleCreateSubmit = async (data: FormData) => {
        try {
            const code = data.get("code") as string;
            const name = data.get("name") as string;
            const params: PresetModel = {
                content: {
                    "author": "",
                    "description": ""
                },
                id: "",
                version: "1.0.0",
                code: code,
                name: name,
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

            // 调用导入 API
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            await post("/presets/import", uploadFormData);

            console.log("导入文件:", file.name);
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
                                <Label htmlFor={`code-${idSuffix}`}>{t("default.code") + "*"}</Label>
                                <Input id={`code-${idSuffix}`} name="code"
                                       required/>
                            </Field>
                            <Field>
                                <Label htmlFor={`name-${idSuffix}`}>{t("default.name") + "*"}</Label>
                                <Input id={`name-${idSuffix}`} name="name"
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
                                <Label htmlFor={`filename-${idSuffix}`}>{t("default.name")}</Label>
                                <Input
                                    id={`filename-${idSuffix}`}
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
            <ResizablePanelGroup orientation="horizontal"
                                 className="rounded-lg border">
                <ResizablePanel defaultSize="300px"
                                minSize="280px"
                                className="flex justify-center">
                    {pager.pageCount === 0 && !pager.search ?
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
                                <PresetCreateButtons idSuffix="preset-empty"/>
                            </EmptyContent>
                            {/* 官方示例 有个帮助按钮，可以留着，以后跳到帮助文档 */}
                            <Button
                                variant="link"
                                asChild
                                className="text-muted-foreground"
                                size="sm">
                                <Link href="#">
                                    Learn More <ArrowUpRightIcon/>
                                </Link>
                            </Button>
                        </Empty> :
                        <div className="flex flex-col w-full">
                            <div className="flex gap-2 flex-row-reverse p-2">
                                <PresetCreateButtons idSuffix="preset-list"/>
                            </div>
                            <form className="flex p-2" action={p => pager.doSearch(p.get("search") as string)}>
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
                            <div className="flex flex-col h-full gap-6 p-2">
                                <ItemGroup>
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
                            <div className="w-full p-1">
                                <PaginationWrapper defaultPageIndex={pager.pageIndex}
                                                   onPageIndexChanged={pager.changePageIndex}
                                                   pageCount={pager.pageCount}
                                                   className="preset-pagination"/>
                            </div>
                        </div>
                    }
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel minSize="300px"
                                className="p-8">
                    <div className="h-full w-full">
                        {children}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </PresetListContext.Provider>
    );
}