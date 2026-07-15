'use client';
import React, {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {TabConfig} from "@/components/custom/tab";
import {ComfyUIModelModel, moduleName} from "../models";
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
import {Button} from "@/components/ui/button";
import {FileDownIcon, FilePlusIcon, LinkIcon, SearchIcon, SquarePenIcon, Trash2Icon, XIcon} from "lucide-react";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {del, post, put} from "@/client";
import {Label} from "@/components/ui/label";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ApiError} from "@/handler/client/models";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {LlmapiModel} from "@/modules/llmapis/models";
import {ImageUploader} from "@/components/custom/image-uploader";
import {BusinessError} from "@/handler/models";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {CustomCombobox} from "@/components/custom/combobox";

const defaultTypes = ["VAE", "Checkpoint", "LORA", "Text Encoder"];
const sourceTypes = ["civital.com", "civital.red"];

async function fillModelFromCivital(url: string, source: string, model: ComfyUIModelModel) {
    if (source.trim() === '' || isNaN(Number(source))) {
        throw new ApiError("source for civital should be a number", "comfyui.source_civital.invalid_source_id");
    }

    const response = await fetch(`${url}/api/v1/model-versions/${source}`);
    const meta = await response.json();
    console.debug(`meta ${source}: `, meta);
    const {name: fileName} = meta.files[0];
    const {name: modelName, type} = meta.model;
    model.type = type;
    model.code = fileName;
    model.name = modelName;
    model.content.url = `${url}/model-versions/${source}`;
    model.content.path = fileName;
    model.content.description = meta.name;
    model.content.html = meta.description;
    model.content.downloadUrl = meta.downloadUrl;
    if (meta.images.length > 0) {
        model.content.coverSrc = meta.images[0].url;
    }
}

function ContentItem({model}: { model: ComfyUIModelModel }) {

    const t = useTranslations();
    const [key, setKey] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const changed = useRef(false);
    const {handleError, handleSuccess} = useErrorHandler();
    const {fetch} = useModelPagedItemsState();

    const handleUpdate = async (data: FormData) => {
        try {
            let coverId: string | null = null;
            if (!changed.current) {
                coverId = model.content.coverId
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

            await put("/comfyuis/models/{id}",
                {
                    code: model.code,
                    name: data.get("name"),
                    content: {
                        description: data.get("description"),
                        path: data.get("path"),
                        url: data.get("url"),
                        coverSrc: data.get("cover_src"),
                        coverId
                    }
                } as Partial<LlmapiModel>,
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

    let src = '/images/default_cover.png';
    if (model.content.coverId)
        src = `/api/images/${model.content.coverId}`;
    else if (model.content.coverSrc)
        src = model.content.coverSrc;

    return (
        <Item key={key}
              className={'min-w-1/4 w-64 overflow-hidden relative'}
              variant={"outline"}>
            <ItemHeader>
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <AspectRatio ratio={1}>
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
                        </AspectRatio>
                    </HoverCardTrigger>
                    <HoverCardContent asChild className={'bg-card w-full'}>
                        <div dangerouslySetInnerHTML={{__html: model.content.html}}/>
                    </HoverCardContent>
                </HoverCard>
            </ItemHeader>
            <ItemContent className={'h-24'}>
                <ItemTitle>{model.name}</ItemTitle>
                <ItemDescription className={'wrap-break-word break-all'}>
                    {model.content.description}
                </ItemDescription>
            </ItemContent>
            <div className={'absolute top-4 left-4'}>
                <Badge variant="secondary">{model.type}</Badge>
            </div>
            <ItemActions className={'absolute top-4 right-4 rounded bg-white/70 opacity-0 hover:opacity-100'}>
                {
                    model.content.url && <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild
                                    variant="link">
                                <Link href={model.content.url} target="_blank">
                                    <LinkIcon/>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t("default.link")}</p>
                        </TooltipContent>
                    </Tooltip>
                }
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size={'icon'}
                                        onClick={() => setDeleteOpen(true)}
                                        variant="destructive"><Trash2Icon/></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t("default.delete")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {t("default.delete_title", {target: t(`${moduleName}.model`)})}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("default.delete_description", {target: t(`${moduleName}.model`)})}
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

                <Drawer open={updateOpen} onOpenChange={setUpdateOpen}
                        direction={'right'}>
                    <DrawerTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size={'icon'}
                                        onClick={() => setUpdateOpen(true)}
                                        variant="ghost">
                                    <SquarePenIcon/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t("default.update")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </DrawerTrigger>
                    <DrawerContent>
                        <form className={'h-full flex flex-col'} action={handleUpdate}>
                            <DrawerHeader>
                                <DrawerTitle>
                                    {t("default.update_title", {target: t(`${moduleName}.model`)})}
                                </DrawerTitle>
                            </DrawerHeader>
                            <FieldGroup className="p-4 overflow-auto flex-1">
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-cover-${model.id}`}>
                                        {t("default.cover")}
                                    </FieldLabel>
                                    <ImageUploader name="cover`" id={`${moduleName}-cover-${model.id}`}
                                                   className={'max-w-52'}
                                                   accept={"image/png"}
                                                   defaultValue={model.content.coverId ? `/api/images/${model.content.coverId}` : undefined}
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
                                           defaultValue={model.content.url}
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
                                    <Input id={`${moduleName}-type-${model.id}`}
                                           defaultValue={model.type}
                                           name="type"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-path-${model.id}`}>
                                        {t("comfyui.model_path")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-path-${model.id}`}
                                           defaultValue={model.content.path}
                                           name="path"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-description-${model.id}`}>
                                        {t("default.description")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-description-${model.id}`}
                                           defaultValue={model.content.description}
                                           name="description"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-url-${model.id}`}>
                                        {t("default.url")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-url-${model.id}`}
                                           defaultValue={model.content.url}
                                           name="url"/>
                                </Field>
                            </FieldGroup>
                            <DrawerFooter>
                                <Button type={'submit'}>
                                    {t("default.save")}
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">
                                        {t("default.cancel")}
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </form>
                    </DrawerContent>
                </Drawer>
            </ItemActions>
        </Item>);
}

function Content() {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const {items, fetch, search} = useModelPagedItemsState();
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    // 受控组件，解决搜索刷新后光标位置问题
    const [searchInput, setSearchInput] = useState(search?.fuzzy ?? "");

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
            const sourceType = data.get("source_type") as string;
            const source = data.get("source") as string;
            console.debug(`source: ${sourceType} ${source}`);
            const model: ComfyUIModelModel = {
                id: "",
                code: "",
                name: "",
                type: "",
                content: {}
            };
            if (sourceType === "civital.com") {
                // https://civitai.com
                await fillModelFromCivital("https://civitai.com", source, model);
            } else if (sourceType === "civital.red") {
                // https://civitai.red
                await fillModelFromCivital("https://civitai.red", source, model);
            }

            await post("/comfyuis/models/import", (new TextEncoder()).encode(JSON.stringify(model)), {
                headers: {
                    'Content-Type': "application/octet-stream"
                }
            });
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
                    <DialogTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => setCreateOpen(true)}>
                                    <FilePlusIcon/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('default.create')}</p>
                            </TooltipContent>
                        </Tooltip>
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline"
                                        onClick={() => setImportOpen(true)}>
                                    <FileDownIcon/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('default.import')}</p>
                            </TooltipContent>
                        </Tooltip>
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
                                    <FieldLabel
                                        htmlFor={`${moduleName}-import-source_type`}>{t("comfyui.source_type")}</FieldLabel>
                                    <Select name="source_type" required
                                            defaultValue={"civital.red"}>
                                        <SelectTrigger className="w-full"
                                                       id={`${moduleName}-import-source_type`}>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                {sourceTypes.map((e) =>
                                                    <SelectItem key={e} value={e}>
                                                        {t(`${moduleName}.source_${e}`)}
                                                    </SelectItem>
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel
                                        htmlFor={`${moduleName}-import-source`}>{t("comfyui.source_id")}</FieldLabel>
                                    <Input id={`${moduleName}-import-source`} name="source" required/>
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">{t("default.cancel")}</Button>
                                </DialogClose>
                                <Button type="submit">
                                    {t("default.import")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <form action={applySearch}>
                <div className="grid md:grid-cols-2 gap-4">
                    <CustomCombobox defaultValue={[]}
                                    name={"type"}
                                    placeholder={t("default.types")}
                                    extraValue={defaultTypes}/>
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
                <ItemGroup className={"flex flex-row flex-wrap items-start"}>
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
