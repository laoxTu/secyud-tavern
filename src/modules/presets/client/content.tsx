'use client';
import React, {ChangeEvent, useRef, useState} from "react";
import Image from "next/image"
import {useTranslations} from "next-intl";
import {Field, FieldContent, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item";
import {TabConfig} from "@/components/custom/tab";
import {del, get, open, post, put} from "@/client";
import {convertToRequire, moduleName, PresetModel, RequireModel} from "../models";
import {presetTabManager} from "./tabs";
import {getAuthor} from "@/business/client/author";
import {ModelList} from "@/business/client/template/model-list";
import {ModelTabHeader} from "@/business/client/template/tab-header";
import {defaultTags, modelState} from "@/modules/presets/client/models";
import {createUseTabState} from "@/business/client/models";
import {TagBox} from "@/components/custom/combobox";
import {useErrorHandler} from "@/handler/client/error";
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
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {FileDownIcon, SquareArrowRightEnterIcon} from "lucide-react";
import {v4 as uuidv4} from "uuid";
import {Checkbox} from "@/components/ui/checkbox";
import {useRemoteSettingState} from "@/modules/settings/client/models";
import {useRouter} from "next/navigation";
import {BusinessError} from "@/handler/models";
import {getCover} from "@/business/client";
import {ModelCreate} from "@/business/models";
import {StoryModel} from "@/modules/stories/models";

export const usePresetTabState = createUseTabState(presetTabManager);

function PresetImportDialog() {
    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();
    const [importOpen, setImportOpen] = useState(false);
    const [importModels, setImportModels] = useState<RequireModel[]>([]);
    const [selectKeys, setSelectKeys] = useState<string[]>([]);
    const sessionId = useRef<string>(uuidv4());
    const {fetch} = modelState.usePagedItemsState();
    const {setModel} = modelState.useItemState();

    const handleAnalyze = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (file) {
                const models = await post("/presets/import", file, {
                    headers: {
                        'Content-Type': "image/png"
                    },
                    params: {
                        sessionId,
                    }
                }) as RequireModel[];
                setImportModels(models);
                setSelectKeys(models.map(u => u.code));
            }
        } catch (error) {
            handleError(error);
        }
    };
    const handleImport = async (formData: FormData) => {
        try {
            const model = await put("/presets/import", {
                ...Object.fromEntries(importModels.map(u =>
                    [u.code, !!formData.get(`code_${u.code}`)]))
            }, {
                params: {
                    sessionId,
                }
            });
            await setModel(model);
            await fetch();
            setImportOpen(false);
            handleSuccess(t("default.imported_successfully"));
        } catch (error) {
            handleError(error);
        }
    };

    return (<Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <TooltipTrigger onClick={() => {
                sessionId.current = uuidv4();
                setImportModels([]);
                setSelectKeys([]);
                setImportOpen(true);
            }}
                            render={<Button variant="outline"/>}>
                <FileDownIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('default.import')}</p>
            </TooltipContent>
        </DialogTrigger>
        <DialogContent render={<form action={handleImport}/>}>
            <DialogHeader>
                <DialogTitle>
                    {t("default.import_title", {target: t(`default.${moduleName}`)})}
                </DialogTitle>
                <DialogDescription>
                    {t("default.import_description", {target: t(`default.${moduleName}`)})}
                </DialogDescription>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor={`${moduleName}-filename`}>{t("default.name")}</FieldLabel>
                    <Input id={`${moduleName}-filename`} name="filename" type="file"
                           accept={".json,.png"} onChange={handleAnalyze} required/>
                </Field>
                {importModels && <Field>
                    {importModels.map(u =>
                        <FieldContent key={u.code} className="flex-row gap-2">
                            <Checkbox checked={selectKeys.includes(u.code)}
                                      onCheckedChange={b => {
                                          const set = new Set<string>(selectKeys);
                                          b ? set.add(u.code) : set.delete(u.code);
                                          setSelectKeys([...set])
                                      }}
                                      name={`code_${u.code}`}
                                      id={`preset-import-${u.code}`}/>
                            <FieldLabel htmlFor={`preset-import-${u.code}`}>
                                {`${u.name}-${u.code}-${u.version}(${u.author})`}
                            </FieldLabel>
                        </FieldContent>
                    )}
                </Field>}
            </FieldGroup>
            <DialogFooter>
                <Button type="submit">
                    {t("default.import")}
                </Button>
                <DialogClose render={<Button variant="outline"/>}>
                    {t("default.cancel")}
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

function PresetToolbar({model}: { model: PresetModel }) {
    const t = useTranslations();
    const router = useRouter();
    const {handleError} = useErrorHandler();
    const [enterOpen, setEnterOpen] = useState(false);
    const enterStory = async () => {
        try {

            const llmapi = useRemoteSettingState
                .getState().llmapi;
            if (!llmapi) {
                handleError(new BusinessError("default llmapi is not set.", "setting.llmapi_required"));
                return;
            }
            const {id} = await post<ModelCreate<StoryModel>>("/stories", {
                name: model.name,
                requires: [convertToRequire(model)],
                llmapi,
                content: {},
            });
            router.push(`/business/stories/${id}`);
        } catch (err) {
            handleError(err);
        }
    };

    return (<>
        <Dialog open={enterOpen} onOpenChange={setEnterOpen}>
            <DialogTrigger render={<Tooltip/>}>
                <TooltipTrigger onClick={() => setEnterOpen(true)}
                                render={<Button variant={'secondary'}/>}>
                    <SquareArrowRightEnterIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('preset.enter_title')}</p>
                </TooltipContent>
            </DialogTrigger>
            <DialogContent render={<form action={enterStory}/>}>
                <DialogHeader>
                    <DialogTitle>
                        {t("preset.enter_title")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("preset.enter_description")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="submit">
                        {t("default.ensure")}
                    </Button>
                    <DialogClose render={<Button variant="outline"/>}>
                        {t("default.cancel")}
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>);
}

function Content() {
    const t = useTranslations();
    return <ModelList<PresetModel>
        modelState={modelState}
        searchAccessor={data => ({
            tags: data.getAll("tag") as string[]
        })}
        searchContent={() => {
            return (<>
                <TagBox defaultValue={[]}
                        name={"tag"}
                        placeholder={t("default.tags")}
                        items={defaultTags}/>
            </>);
        }}
        itemContent={(model) =>
            <>
                <ItemMedia variant={'image'}>
                    <Image
                        src={getCover(model.content)}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle className="line-clamp-1">
                        {model.name} - <span className="text-muted-foreground">{model.code}</span>
                    </ItemTitle>
                    <ItemDescription>{model.content.author}</ItemDescription>
                </ItemContent>
                <ItemContent className="flex-none text-center">
                    <ItemDescription>{model.version}</ItemDescription>
                </ItemContent>
            </>
        }
        createProps={{
            importComponent: PresetImportDialog,
            createContent: () => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-code`} name="code"
                           required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-name`} name="name" required/>
                </Field>
            </>),
            createHandler: async (data) => {
                return await post<ModelCreate<PresetModel>>("/presets", {
                    version: "1.0.0",
                    code: data.get("code") as string,
                    name: data.get("name") as string,
                    requires: [],
                    tags: [],
                    content: {
                        "author": getAuthor(t),
                        "description": ""
                    },
                });
            }
        }}
        contentProps={{
            toolbar: (model) => <PresetToolbar model={model}/>,
            cloneHandler:
                async (model, data) => {
                    const entity = await get("/presets/{id}", {
                        params: {
                            id: model.id,
                            withDetails: true,
                        }
                    });
                    return await post<ModelCreate<PresetModel>>("/presets", {
                        ...entity, id: undefined,
                        code: data.get("code") as string,
                        name: data.get("name") as string,
                    })
                },
            cloneContent: (model) => (<>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-code`}>{t("default.code") + "*"}</Label>
                    <Input id={`${moduleName}-clone-code`}
                           defaultValue={model.code}
                           name="code" required/>
                </Field>
                <Field>
                    <Label htmlFor={`${moduleName}-clone-name`}>{t("default.name") + "*"}</Label>
                    <Input id={`${moduleName}-clone-name`}
                           defaultValue={model.name}
                           name="name" required/>
                </Field>
            </>),
            exportHandler: async (model) => {
                await open('/presets/{id}/export', {
                    params: {
                        id: model.id,
                    }
                });
            },
            deleteHandler: async (model) => {
                await del('/presets/{id}', {
                    params: {
                        id: model.id,
                    }
                });
            },
            useTabState: usePresetTabState,
            tabManager: presetTabManager
        }}>
    </ModelList>;
}


export const presetNavigationContent: TabConfig = {
    id: moduleName,
    label: () => <ModelTabHeader modelType={moduleName}/>,
    component: Content
} as const;
