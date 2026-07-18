'use client';
import React, {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {TabConfig} from "@/components/custom/tab";
import {imageEntryName, moduleName, StoryImageModel} from "../models";
import {EntryTabHeader} from "@/business/client/template/tab-header";
import {PaginationWrapper} from "@/components/custom/pager";
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
import {
    FilePlusIcon, ImagesIcon,
    LinkIcon,
    SearchIcon,
    SquarePenIcon,
    XIcon
} from "lucide-react";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {del, post, put} from "@/client";
import {Label} from "@/components/ui/label";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {LlmapiModel} from "@/modules/llmapis/models";
import {ImageUploader} from "@/components/custom/image-uploader";
import {BusinessError} from "@/handler/models";
import Link from "next/link";
import {useImagePagedItemsState, useItemState} from "@/modules/stories/client/models";
import {engineName} from "@/engines/regexes/models";
import {DeleteDialog} from "@/components/custom/delete-dialog";


function ContentItem({entry}: { entry: StoryImageModel }) {

    const t = useTranslations();
    const [key, setKey] = useState(0);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const {handleError, handleSuccess} = useErrorHandler();
    const changed = useRef(false);
    const {fetch} = useImagePagedItemsState();
    const {model} = useItemState();

    const handleUpdate = async (data: FormData) => {
        try {
            let imageId: string | null = null;
            if (!changed.current) {
                imageId = entry.imageId;
            } else if (imageFile) {
                if (imageFile.type !== "image/png") {
                    handleError(new BusinessError("Only png file supported."));
                    return;
                }

                const {id} = await post('/images', imageFile, {
                    headers: {
                        'Content-Type': imageFile.type
                    }
                });
                imageId = id;
            }

            await put("/stories/{id}/entries/{entryType}/{entryId}",
                {
                    code: entry.code,
                    name: data.get("name"),
                    imageId
                } as Partial<LlmapiModel>,
                {
                    params: {
                        id: model?.id,
                        entryId: entry.id,
                        entryType: imageEntryName
                    }
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
            await del('/stories/{id}/entries/{entryType}/{entryId}', {
                params: {
                    id: model?.id,
                    entryId: entry.id,
                    entryType: imageEntryName
                }
            });
            handleSuccess(t("default.delete_successfully"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    return (<div className={'min-w-1/4 w-96 h-auto p-2'}>
        <Item key={key}
              className={'relative'}
              variant={"outline"}>
            <ItemHeader>
                <Image
                    src={`/api/images/${entry.imageId}`}
                    alt={`${entry.code ?? ""}-${entry.name ?? ""}`}
                    width={100}
                    height={100}
                    className="w-full h-auto rounded-sm"
                />
            </ItemHeader>
            <ItemContent>
                <ItemTitle>
                    {entry.code}
                </ItemTitle>
                <ItemDescription className={'wrap-break-word break-all'}>
                    {entry.name}
                </ItemDescription>
            </ItemContent>
            <ItemActions className={'absolute top-4 right-4 rounded bg-white/70 opacity-0 hover:opacity-100'}>
                <Tooltip>
                    <TooltipTrigger className={buttonVariants({variant: 'link'})}
                                    render={<Link href={`/api/images/${entry.imageId}`} target="_blank"/>}>
                        <LinkIcon/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t("default.link")}</p>
                    </TooltipContent>
                </Tooltip>

                <DeleteDialog handleDelete={handleDelete}
                              itemName={`${moduleName}.${imageEntryName}`}/>

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
                    <DialogContent>
                        <form className={'h-full flex flex-col'} action={handleUpdate}>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("default.update_title", {target: t(`${moduleName}.${imageEntryName}`)})}
                                </DialogTitle>
                            </DialogHeader>
                            <FieldGroup className="p-4 overflow-auto flex-1">
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-cover-${entry.id}`}>
                                        {t("default.cover")}
                                    </FieldLabel>
                                    <ImageUploader name="cover`" id={`${moduleName}-cover-${entry.id}`}
                                                   className={'max-w-52'}
                                                   accept={"image/png"}
                                                   defaultValue={`/api/images/${entry.imageId}`}
                                                   onChange={file => {
                                                       console.debug("file", file);
                                                       setImageFile(file);
                                                       changed.current = true;
                                                   }}/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-code-${entry.id}`}>
                                        {t("default.code")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-code-${entry.id}`}
                                           defaultValue={entry.code}
                                           disabled
                                           name="code"/>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor={`${moduleName}-name-${entry.id}`}>
                                        {t("default.name")}
                                    </FieldLabel>
                                    <Input id={`${moduleName}-name-${entry.id}`}
                                           defaultValue={entry.name}
                                           name="name"/>
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

export function Content() {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const {items, fetch, search, params} = useImagePagedItemsState();
    const {model} = useItemState();
    const [createOpen, setCreateOpen] = useState(false);
    // 受控组件，解决搜索刷新后光标位置问题
    const [searchInput, setSearchInput] = useState(search?.fuzzy ?? "");

    const handleCreate = async (data: FormData) => {
        try {
            await post("/stories/{id}/entries/{entryType}", {
                id: "",
                code: data.get("code") as string,
                name: data.get("name") as string,
                content: {}
            }, {
                params: {
                    id: model?.id,
                    entryType: imageEntryName,
                }
            })
            await fetch();
            handleSuccess(t("default.created_successfully"));
        } catch (error) {
            handleError(error);
        } finally {
            setCreateOpen(false);
        }
    };

    const applySearch = async (data: FormData) => {
        try {
            const search = data.get("search") as string;
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
        if (model && model.id !== params.id) {
            void fetch({params: {entryType: imageEntryName, id: model.id}});
        }
    }, []);

    return (<div className={'h-full overflow-hidden flex flex-col gap-2 p-4'}>
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
                                    {t("default.create_title", {target: t(`${moduleName}.image`)})}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("default.create_description", {target: t(`${moduleName}.image`)})}
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup className={'overflow-auto'}>
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
            </div>
            <form action={applySearch}>
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
            </form>
        </div>
        <div className={'flex-1 flex flex-col overflow-hidden'}>
            <div className={'flex-1 overflow-y-auto'}>
                <ItemGroup className={"flex flex-row flex-wrap items-start gap-0"}>
                    {items && items.map((u) => (<ContentItem entry={u} key={u.id}/>))}
                </ItemGroup>
            </div>

            <PaginationWrapper usePagedItemsState={useImagePagedItemsState}/>
        </div>
    </div>)
}

export const tabConfig: TabConfig = {
    id: engineName,
    label: () => <EntryTabHeader space={moduleName} value={imageEntryName} icon={ImagesIcon}/>,
    component: Content
}