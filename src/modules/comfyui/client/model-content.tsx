'use client';
import React, {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {TabConfig} from "@/components/custom/tab";
import {
    ComfyUIModelContentModel,
    ComfyUIModelModel,
    modelTypes,
    moduleName,
} from "../models";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {PaginationWrapper} from "@/components/custom/pager";
import {useModelPagedItemsState} from "@/modules/comfyui/client/models";
import {Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle} from "@/components/ui/item";
import Image from "next/image";
import {useErrorHandler} from "@/handler/client/error";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button, buttonVariants} from "@/components/ui/button";
import {DownloadIcon, FileDownIcon, FilePlusIcon, LinkIcon, SearchIcon, SquarePenIcon, XIcon} from "lucide-react";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {del, post, put} from "@/client";
import {Label} from "@/components/ui/label";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {ImageUploader} from "@/components/custom/image-uploader";
import {BusinessError} from "@/handler/models";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {TagBox} from "@/components/custom/combobox";
import {comfyUIModelImporterRegistry} from "@/modules/comfyui/client/impoter";
import {DeleteDialog} from "@/components/custom/delete-dialog";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {Selector} from "@/components/custom/selector";
import {ComfyUIModelImporter} from "@/modules/comfyui/client/impoter-models";
import {useVisible} from "@/utils/client/visible";

function ItemCover({model}: { model: ComfyUIModelModel }) {
    let src = '/images/default_cover.png';
    const content = model.content as ComfyUIModelContentModel;
    console.debug("cover id", content.coverId);
    if (content.coverId)
        src = `/api/images/${content.coverId}`;
    else if (content.coverSrc)
        src = content.coverSrc;
    return (<AspectRatio ratio={1}>
        {src.endsWith('mp4') ?
            <video src={src} controls preload="metadata"
                   className="object-cover rounded-sm aspect-square"/> :
            <Image
                src={src}
                alt={model.name}
                fill
                unoptimized
                className="object-cover rounded-sm"
            />}
    </AspectRatio>);
}

function ContentItem({model}: { model: ComfyUIModelModel }) {

    const t = useTranslations();
    const [key, setKey] = useState(0);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const {change, className} = useVisible();
    const {handleError, handleSuccess} = useErrorHandler();
    const changed = useRef(false);
    const {fetch} = useModelPagedItemsState();
    const content = model.content as ComfyUIModelContentModel;
    const formRef = useRef<HTMLFormElement>(null);

    const handleUpdate = async (data: FormData) => {
        try {
            let coverId: string | undefined = undefined;
            if (!changed.current) {
                coverId = content.coverId;
            } else if (coverFile) {
                if (coverFile.type !== "image/png") {
                    handleError(new BusinessError("Only png file supported."));
                    return;
                }

                const {id} = await post('/images', coverFile, {
                    headers: {
                        'Content-Type': coverFile.type
                    }
                });
                coverId = id;
            }

            const newContent: ComfyUIModelContentModel = {
                description: data.get("description") as string,
                path: data.get("path") as string,
                url: data.get("url") as string,
                html: data.get("html") as string,
                downloadUrl: data.get("download_url") as string,
                baseModel: data.get("base_model") as string,
                coverSrc: data.get("cover_src") as string,
                coverId
            };

            await put("/comfyuis/models/{id}",
                {
                    code: model.code,
                    name: data.get("name"),
                    type: data.get("type"),
                    content: newContent
                } as Partial<ComfyUIModelModel>,
                {
                    params: {"id": model.id,}
                });
            setKey(u => u + 1);
            setUpdateOpen(false);
            handleSuccess(t("default.saved_successfully"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDelete = async () => {
        try {
            await del('/comfyuis/models/{id}', {
                params: {
                    id: model.id,
                }
            });
            handleSuccess(t("default.delete_successfully"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDownload = async () => {
        try {
            await post('/comfyuis/models/{id}/download', {}, {
                params: {
                    id: model.id,
                }
            });
            handleSuccess(t("comfyui.download_started"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    return (<div className={'min-w-1/4 w-64 p-2'}>
        <Item key={key}
              className={'overflow-hidden relative'}
              variant={"outline"}>
            <ItemHeader onClick={change}>
                <HoverCard>
                    <HoverCardTrigger className={'w-full'}>
                        <ItemCover model={model}/>
                    </HoverCardTrigger>
                    <HoverCardContent className={'bg-card overflow-auto w-full max-w-lvw max-h-96'}
                                      render={
                                          content.html ?
                                              <div dangerouslySetInnerHTML={{__html: content.html}}/> :
                                              <div></div>
                                      }>
                    </HoverCardContent>
                </HoverCard>
            </ItemHeader>
            <ItemContent className={'h-24'}>
                <ItemTitle>{model.name}</ItemTitle>
                <ItemDescription className={'wrap-break-word break-all'}>
                    {content.description}
                </ItemDescription>
            </ItemContent>
            <div className={'absolute top-4 left-4 flex flex-col gap-2'}>
                <Badge variant="secondary">{model.type}</Badge>
                <Badge variant="secondary">{content.baseModel}</Badge>
            </div>
            <ItemActions className={`absolute top-4 right-4 rounded bg-white/70 ${className}`}>
                {
                    content.url && <Tooltip>
                        <TooltipTrigger className={buttonVariants({variant: 'link'})}
                                        render={<Link href={content.url} target="_blank"/>}>
                            <LinkIcon/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t("default.link")}</p>
                        </TooltipContent>
                    </Tooltip>
                }

                {
                    content.downloadUrl && <Tooltip>
                        <TooltipTrigger render={<Button variant={"ghost"}/>}
                                        onClick={handleDownload}>
                            <DownloadIcon/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t("comfyui.download_server")}</p>
                        </TooltipContent>
                    </Tooltip>
                }

                <DeleteDialog handleDelete={handleDelete}
                              itemName={`${moduleName}.model`}/>

                <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                    <DialogTrigger render={<Tooltip/>}>

                        <TooltipTrigger onClick={() => setUpdateOpen(true)}
                                        render={<Button size={'icon'}
                                                        variant="ghost"/>}>
                            <SquarePenIcon/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t("default.update")}</p>
                        </TooltipContent>
                    </DialogTrigger>
                    <DialogContent style={{maxWidth: '86%', height: '86%'}}>
                        <form className={'flex flex-col overflow-hidden'}
                              action={handleUpdate} ref={formRef}>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("default.update_title", {target: t(`${moduleName}.model`)})}
                                </DialogTitle>
                            </DialogHeader>
                            <FieldGroup className={'overflow-auto p-2 flex-1'}>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-cover-${model.id}`}>
                                        {t("default.cover")}
                                    </FieldLabel>
                                    <ImageUploader name="cover`" id={`${moduleName}-cover-${model.id}`}
                                                   className={'max-w-52'}
                                                   accept={"image/png"}
                                                   defaultValue={content.coverId ? `/api/images/${content.coverId}` : undefined}
                                                   onChange={file => {
                                                       console.debug("file", file);
                                                       setCoverFile(file);
                                                       changed.current = true;
                                                   }}/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-cover_src-${model.id}`}>
                                        {t("default.cover_src")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-cover_src-${model.id}`}
                                           defaultValue={content.coverSrc}
                                           name="cover_src"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-code-${model.id}`}>
                                        {t("default.code")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-code-${model.id}`}
                                           defaultValue={model.code}
                                           disabled
                                           name="code"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-name-${model.id}`}>
                                        {t("default.name")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-name-${model.id}`}
                                           defaultValue={model.name}
                                           name="name"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-type-${model.id}`}>
                                        {t("default.type")}
                                    </FieldLabel>
                                    <Selector name={'type'} id={`${moduleName}-type-${model.id}`}
                                              defaultValue={model.type}
                                              items={modelTypes}/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-path-${model.id}`}>
                                        {t("comfyui.model_path")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-path-${model.id}`}
                                           defaultValue={content.path}
                                           name="path"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-url-${model.id}`}>
                                        {t("default.url")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-url-${model.id}`}
                                           defaultValue={content.url}
                                           name="url"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-download_url-${model.id}`}>
                                        {t("comfyui.download_url")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-download_url-${model.id}`}
                                           defaultValue={content.downloadUrl}
                                           name="download_url"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-base_model-${model.id}`}>
                                        {t("comfyui.base_model")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-base_model-${model.id}`}
                                           defaultValue={content.baseModel}
                                           name="base_model"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-description-${model.id}`}>
                                        {t("default.description")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-description-${model.id}`}
                                           defaultValue={content.description}
                                           name="description"/>
                                </Field>
                                <Field>
                                    <FieldLabel>
                                        {t("default.html")}
                                    </FieldLabel>
                                    <MonacoEditor name={"html"}
                                                  defaultValue={content.html ?? ""}
                                                  language={"html"}
                                                  formRef={formRef}/>
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <Button type={'submit'}>
                                    {t("default.save")}
                                </Button>
                                <DialogClose render={<Button variant="outline"/>}>
                                    {t("default.cancel")}
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </ItemActions>
        </Item>
    </div>);
}

function Content() {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const {items, fetch, search} = useModelPagedItemsState();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    // 受控组件，解决搜索刷新后光标位置问题
    const [searchInput, setSearchInput] = useState(search?.fuzzy ?? "");
    const [editor, setEditor] = useState<ComfyUIModelImporter | null>(
        comfyUIModelImporterRegistry.records["civitai"] ?? null);

    const handleCreate = async (data: FormData) => {
        try {
            await post("/comfyuis/models", {
                id: "",
                code: data.get("code") as string,
                name: data.get("name") as string,
                content: {}
            })
            await fetch();
            handleSuccess(t("default.created_successfully"));
        } catch (error) {
            handleError(error);
        } finally {
            setCreateOpen(false);
        }
    };

    const handleImport = async (data: FormData) => {
        try {
            if (!editor) {
                handleError(new BusinessError("importer is required.", "comfyui.importer_invalid"));
                return;
            }
            const models = await editor.generate(data);
            const encoder = new TextEncoder();
            for (const model of models) {
                const data = encoder.encode(JSON.stringify(model));
                await post("/comfyuis/models/import", data, {
                    headers: {
                        'Content-Type': "application/octet-stream"
                    }
                });
            }
            await fetch();
            setImportOpen(false);
            handleSuccess(t("default.imported_successfully"));
        } catch (error) {
            handleError(error);
        }
    };

    const applySearch = async (data: FormData) => {
        try {
            const search = {
                types: data.getAll("type") as string[],
                fuzzy: data.get("search") as string,
            }
            console.debug("search", search);
            await fetch({search});
        } catch (err) {
            handleError(err);
        }
    };
    const resetSearch = async () => {
        try {
            setSearchInput("");
            await fetch({
                ...search ?? {},
                fuzzy: ""
            });
        } catch (err) {
            handleError(err);
        }
    }

    useEffect(() => {
        (async () => {
            await fetch();
        })();
    }, []);

    return (<div className={'h-full flex flex-col gap-2 p-4'}>
        <div className={'flex flex-col gap-2'}>
            <div className={'overflow-x-auto flex flex-row-reverse scrollbar-none gap-1 justify-normal'}>
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
                                    {t("default.create_title", {target: t(`default.${moduleName}_model`)})}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("default.create_description", {target: t(`default.${moduleName}_model`)})}
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                                    <Input id={`${moduleName}-code`} name="code" required/>
                                </Field>
                                <Field>
                                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                                    <Input id={`${moduleName}-name`} name="name" required/>
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <Button type="submit">
                                    {t("default.create")}
                                </Button>
                                <DialogClose render={<Button variant="outline"/>}>
                                    {t("default.cancel")}
                                </DialogClose>
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
                                    {t("default.import_title", {target: t(`default.${moduleName}_model`)})}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("default.import_description", {target: t(`default.${moduleName}_model`)})}
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-importer`}>
                                        {t(`${moduleName}.importer`)}
                                    </FieldLabel>
                                    <Selector id={`${moduleName}-importer`}
                                              items={comfyUIModelImporterRegistry.getSorted()}
                                              name="importer"
                                              value={editor}
                                              onValueChange={setEditor}
                                              labelAccessor={e => t(`${moduleName}.importer_${e.id}`)}
                                              valueAccessor={e => e.id}/>
                                </Field>
                                {editor?.component && (() => {
                                    const Component = editor.component;
                                    return <Component/>
                                })()}
                            </FieldGroup>
                            <DialogFooter>
                                <Button type="submit">
                                    {t("default.import")}
                                </Button>
                                <DialogClose render={<Button variant="outline"/>}>
                                    {t("default.cancel")}
                                </DialogClose>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <form action={applySearch}>
                <div className="grid md:grid-cols-2 gap-4">
                    <TagBox defaultValue={[]}
                            name={"type"}
                            placeholder={t("default.types")}
                            items={modelTypes}/>
                    <InputGroup>
                        <InputGroupInput name="search" id={`comfyui-model-list-search`}
                                         placeholder={t("default.search")}
                                         value={searchInput}
                                         onChange={(e) => setSearchInput(e.target.value)}/>
                        <InputGroupAddon align={"inline-end"}>
                            <InputGroupButton onClick={resetSearch}>
                                <XIcon/>
                            </InputGroupButton>
                            <InputGroupButton type="submit">
                                <SearchIcon/>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </form>
        </div>
        <div className={'flex-1 flex flex-col overflow-hidden'}>
            <div className={'flex-1 overflow-y-auto'}>
                <ItemGroup className={"flex flex-row flex-wrap items-start gap-0"}>
                    {items && items.map((u) => (<ContentItem model={u} key={u.id}/>))}
                </ItemGroup>
            </div>

            <PaginationWrapper usePagedItemsState={useModelPagedItemsState}/>
        </div>
    </div>)
}

export const comfyuiModelNavigationContent: TabConfig = {
    id: `${moduleName}_model`,
    label: () => <ModelTabHeader modelType={`${moduleName}_model`}/>,
    component: Content
} as const;
