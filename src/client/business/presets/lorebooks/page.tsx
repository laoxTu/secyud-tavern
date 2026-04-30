'use client';
import {useTranslations} from "next-intl";
import {BookIcon} from "lucide-react";
import {useErrorHandler} from "@/client/errors";
import {del, get, post, put} from "@/client";
import {toast} from "sonner";
import React, {useCallback, useMemo, useState} from "react";
import {usePager} from "@/client/components/pager";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {ChevronsDownIcon, ChevronsUpIcon, FolderOpenIcon, SearchIcon, XIcon} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {Card, CardContent} from "@/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Separator} from "@/components/ui/separator";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import {TabConfig} from "@/client/components/tab";
import {usePresetContext} from "@/client/business/presets";
import {PaginationWrapper} from "@/client/components/pager/component";
import {lorebookMatchEditorRegistry} from "@/client/business/presets/lorebook/index";
import {PagedResult} from "@/shared/models";
import {PresetModel} from "@/shared/business/presets";

export const tabConfigId = "lorebook";

function Navigation() {
    const t = useTranslations();

    return (
        <>
            <BookIcon/>
            {t("preset.lorebook")}
        </>
    );
}

function CreateButtons({refreshLorebooks}: {
    refreshLorebooks: () => Promise<void>
}) {
    const t = useTranslations();
    const {preset} = usePresetContext();
    if (!preset) {
        throw new Error("preset.not_found");
    }
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);

    const handleCreateSubmit = async (data: FormData) => {
        try {
            const params: any = {
                name: data.get("name") as string,
                matchType: "normal",
                matchExpression: [],
                content: "",
                priorityLayer: 100,
                priorityOrder: 100,
            };
            await post("/presets/{id}/entries/{entryType}", params, {
                params: {
                    "id": preset.id,
                    "entryType": tabConfigId,
                }
            });
            setCreateOpen(false);
            await refreshLorebooks();
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
                            <DialogTitle>{t("default.create_title", {target: t(`preset.${tabConfigId}`)})}</DialogTitle>
                            <DialogDescription>
                                {t("default.create_description", {target: t(`preset.${tabConfigId}`)})}
                            </DialogDescription>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <Label htmlFor={`lorebook-name`}>{t("default.name") + "*"}</Label>
                                <Input id={`lorebook-name`} name="name"
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
        </>
    );
}

function Editor({entry, refreshLorebooks}: {
    entry: any,
    refreshLorebooks: () => Promise<void>
}) {
    const matchEditorRegistry = useMemo(() => lorebookMatchEditorRegistry, []);
    const matchEditors = matchEditorRegistry.getSorted();
    const t = useTranslations();
    const {preset} = usePresetContext();
    if (!preset) {
        throw new Error("preset.not_found");
    }
    const {handleError} = useErrorHandler();
    const [matchType, setMatchType] = useState<string>(entry.matchType);
    const [editor, setEditor] = useState(matchEditorRegistry.records[matchType]);
    const [matchExpression, setMatchExpression] = useState<string>(entry.matchExpression);
    const [isOpen, setIsOpen] = React.useState(true)
    const handleSubmit = async (data: FormData) => {
        try {
            const params: Record<string, any> = {
                name: data.get("name") as string,
                matchType: matchType,
                matchExpression: matchExpression,
                content: data.get("content") as string,
                priorityLayer: Number(data.get("priorityLayer")),
                priorityOrder: Number(data.get("priorityOrder")),
            };

            await put("/presets/{id}/entries/{entryType}/{entryId}", params, {
                params: {
                    "id": preset.id,
                    "entryId": entry.id,
                    "entryType": tabConfigId
                }
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshLorebooks();
        } catch (error) {
            handleError(error);
        }
    };
    const handleDelete = async () => {
        try {

            await del("/presets/{id}/entries/{entryType}/{entryId}", {
                params: {
                    "id": preset.id,
                    "entryId": entry.id,
                    "entryType": tabConfigId
                }
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshLorebooks();
        } catch (error) {
            handleError(error);
        }
    };
    const handleDisableSet = useCallback(async (enabled: boolean) => {
        try {
            await put("/presets/{id}/entries/{entryType}/{entryId}/disabled", {}, {
                params: {
                    "id": preset.id,
                    "entryId": entry.id,
                    "entryType": tabConfigId,
                    "disabled": !enabled
                }
            });
            toast.success(t(enabled ? "default.enable_item" : "default.disable_item"), {
                richColors: true
            });
            await refreshLorebooks();
        } catch (error) {
            handleError(error);
        }
    }, [entry.id, handleError, preset.id, refreshLorebooks, t]);
    const handleMatchTypeChange = useCallback((type: string) => {
        setMatchType(type);
        const newEditor = matchEditorRegistry.records[type];
        setEditor(newEditor);
        const isValid = newEditor.validate(matchExpression);
        if (!isValid) {
            setMatchExpression(newEditor.defaultValue);
        }
    }, [matchEditorRegistry, matchExpression]);

    return (
        <Card className={"w-full p-2"}>
            <CardContent>
                <Collapsible className="rounded-md"
                             open={isOpen}
                             onOpenChange={setIsOpen}>
                    <div className={"flex w-full gap-4"}>
                        <CollapsibleTrigger asChild>
                            <label className={"w-full"}>
                                {entry.name}
                            </label>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-2"
                             onClick={(e) => e.stopPropagation()}>
                            <Switch id={`lorebook-disabled-${entry.id}`}
                                    defaultChecked={!entry.disabled}
                                    onCheckedChange={handleDisableSet}/>
                            <Label className={"min-w-12"}
                                   htmlFor={`lorebook-disabled-${entry.id}`}>
                                {t("default.enabled")}
                            </Label>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">{t("default.delete")}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t("default.delete_title", {target: t(`preset.${tabConfigId}`)})}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("default.delete_description", {target: t(`preset.${tabConfigId}`)})}
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
                    <CollapsibleContent>
                        <form action={handleSubmit}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`lorebook-name-${entry.id}`}>
                                                    {t("default.name")}
                                                </FieldLabel>
                                                <Input name="name"
                                                       id={`lorebook-name-${entry.id}`}
                                                       defaultValue={entry.name}/>
                                            </Field>
                                            <Field>
                                                <FieldLabel>
                                                    {t("lorebook.match_type")}
                                                </FieldLabel>
                                                <Select name="matchType"
                                                        value={matchType}
                                                        onValueChange={handleMatchTypeChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        <SelectGroup>
                                                            {matchEditors.map((e) =>
                                                                <SelectItem key={e.id} value={e.id}>
                                                                    {t(`lorebook.match_type_${e.id}`)}
                                                                </SelectItem>
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        </div>
                                        {editor && (
                                            () => {
                                                const EditorComponent = editor.component;
                                                return <EditorComponent value={matchExpression}
                                                                        onValueChanged={setMatchExpression}/>;
                                            }
                                        )()}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`lorebook-priorityLayer-${entry.id}`}>
                                                    {t("lorebook.priority_layer")}
                                                </FieldLabel>
                                                <Input name="priorityLayer" type={"number"}
                                                       id={`lorebook-priorityLayer-${entry.id}`}
                                                       defaultValue={entry.priorityLayer}/>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor={`lorebook-priorityOrder-${entry.id}`}>
                                                    {t("lorebook.priority_order")}
                                                </FieldLabel>
                                                <Input name="priorityOrder" type={"number"}
                                                       id={`lorebook-priorityOrder-${entry.id}`}
                                                       defaultValue={entry.priorityOrder}/>
                                            </Field>
                                        </div>
                                        <Field>
                                            <FieldLabel htmlFor={`lorebook-content-${entry.id}`}>
                                                {t("default.content")}
                                            </FieldLabel>
                                            <Textarea name="content"
                                                      id={`lorebook-content-${entry.id}`}
                                                      defaultValue={entry.content}/>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>
                                <Field orientation="horizontal">
                                    <Button type="submit">{t("default.save")}</Button>
                                    <Button type="button" variant={"outline"}
                                            onClick={refreshLorebooks}>{t("default.reset")}</Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}

function Content() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const {preset, refreshPreset} = usePresetContext();
    if (!preset) {
        throw new Error("preset.not_found");
    }
    const [searchInput, setSearchInput] = useState('');
    const pager = usePager({
        fetcher: async params => await get("/presets/{id}/entries/{entryType}",
            {
                params: {
                    ...params,
                    "id": preset.id,
                    "entryType": tabConfigId,
                }
            }) as PagedResult<any>,
        defaultPageSize: 5
    });

    const handleSubmit = async (data: FormData) => {
        try {
            const includeName = data.get("includeName") as boolean | null;
            const params: Partial<PresetModel> = {
                content: {
                    "lorebook": {
                        includeName: includeName ?? false
                    }
                },
            };
            await put("/presets/{id}", params, {
                params: {"id": preset.id,}
            });
            toast.success(t("default.saved_successfully"), {
                richColors: true
            });
            await refreshPreset();
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <div className={"flex w-full h-full"}>
            <form action={handleSubmit}
                  className={"w-48"}>
                <FieldGroup className={"flex flex-col h-full"}>
                    <FieldSet className={"flex-1 p-2 overflow-auto"}>
                        <FieldGroup>
                            <Field orientation={"horizontal"}>
                                <Checkbox name="includeName" id="preset-lorebook-includeName"
                                          defaultChecked={preset.content.lorebook?.includeName ?? false}/>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Label htmlFor="preset-lorebook-includeName">
                                            {t("lorebook.include_name")}
                                        </Label>
                                    </TooltipTrigger>
                                    <TooltipContent className={"max-w-xs"}>
                                        <p>{t("lorebook.include_name_description")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <Field orientation="horizontal">
                        <Button type="submit">{t("default.save")}</Button>
                        <Button type="button" variant={"outline"} onClick={refreshPreset}>{t("default.reset")}</Button>
                    </Field>
                </FieldGroup>
            </form>
            <Separator orientation={"vertical"}/>
            {pager.pageCount === 0 && !pager.search && !pager.loading ?
                <div className={"flex flex-1 h-full pb-24"}>
                    <Empty className={"m-auto"}>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FolderOpenIcon/>
                            </EmptyMedia>
                            <EmptyTitle>{t("default.empty_title", {target: t(`preset.${tabConfigId}`)})}</EmptyTitle>
                            <EmptyDescription>
                                {t("default.empty_description", {target: t(`preset.${tabConfigId}`)})}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <CreateButtons refreshLorebooks={() => pager.refresh()}/>
                        </EmptyContent>
                    </Empty>
                </div> :
                <div className={"flex-1 flex flex-col p-2 gap-1"}>
                    <div className="flex gap-2 p-2">
                        <form action={p => pager.doSearch(p.get("search") as string)}
                              className={"flex-1"}>
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
                        <CreateButtons refreshLorebooks={() => pager.refresh()}/>
                    </div>
                    <div className="flex-1 overflow-auto space-y-2 p-2">
                        {pager.data.map((data, i) =>
                            <Editor key={i} entry={data}
                                    refreshLorebooks={() => pager.refresh()}/>
                        )}
                    </div>
                    <div className="w-full p-1">
                        <PaginationWrapper defaultPageIndex={pager.pageIndex}
                                           onPageIndexChanged={pager.changePageIndex}
                                           pageCount={pager.pageCount}
                                           className="preset-pagination"/>
                    </div>
                </div>
            }
        </div>
    );
}

export const tabConfig: TabConfig = {
    id: tabConfigId, label: Navigation, component: Content
}