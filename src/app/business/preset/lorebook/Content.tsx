'use client';

import {useTranslations} from "next-intl";
import {useErrorHandler} from "@/components/message";
import {usePresetContext} from "@/app/business/preset";
import {PresetModel} from "@/business/preset/models";
import {del, get, post, put} from "@/api/client";
import {toast} from "sonner";
import {PaginationWrapper} from "@/components/pager/nodes/PaginationWrapper";
import React, {useCallback, useState} from "react";
import {usePager} from "@/components/pager";
import {PagedResult} from "@/models/common";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {lorebookEditorRegistry} from "@/app/business/preset/lorebook/index";
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
import {ChevronsDownIcon, ChevronsUpIcon, FolderOpenIcon} from "lucide-react";
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
import {Skeleton} from "@/components/ui/skeleton";
import {Separator} from "@/components/ui/separator";

export const entryType = "lorebook";

function PresetLorebookCreateButtons({refreshLorebooks}: {
    refreshLorebooks: () => Promise<void>
}) {
    const t = useTranslations();
    const {preset} = usePresetContext();
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
                    "entryType": entryType,
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
                            <DialogTitle>{t("preset.create")}</DialogTitle>
                            <DialogDescription>
                                {t("preset.create_description")}
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


function PresetLorebookEditor({entry, refreshLorebooks}: {
    entry: any,
    refreshLorebooks: () => Promise<void>
}) {

    const t = useTranslations();
    const {preset} = usePresetContext();
    const {handleError} = useErrorHandler();
    const [matchType, setMatchType] = useState<string>(entry.matchType);
    const [editor, setEditor] = useState(lorebookEditorRegistry.records[matchType]);
    const [matchExpression, setMatchExpression] = useState<string>(entry.matchExpression);
    const [isOpen, setIsOpen] = React.useState(false)
    const handleSubmit = async (data: FormData) => {
        try {
            const params: Record<string, any> = {
                name: data.get("name") as string,
                matchType: matchType,
                matchExpression: matchExpression,
                priorityLayer: Number(data.get("priorityLayer")),
                priorityOrder: Number(data.get("priorityOrder")),
            };

            await put("/presets/{id}/entries/{entryType}/{entryId}", params, {
                params: {
                    "id": preset.id,
                    "entryId": entry.id,
                    "entryType": entryType
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
                    "entryType": entryType
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
                    "entryType": entryType,
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
        const newEditor = lorebookEditorRegistry.records[type];
        setEditor(newEditor);
        const isValid = newEditor.validate(matchExpression);
        if (!isValid) {
            setMatchExpression(newEditor.defaultValue);
        }
    }, [matchExpression]);

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
                                    <AlertDialogTitle>{t("lorebook.delete_title")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("lorebook.delete_description")}
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
                                                            {lorebookEditorRegistry.getSorted().map((e) =>
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

export default function PresetLorebookContent() {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const {preset, refreshPreset} = usePresetContext();

    const pager = usePager({
        fetcher: async params => await get("/presets/{id}/entries/{entryType}",
            {
                params: {
                    ...params,
                    "id": preset.id,
                    "entryType": entryType,
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
            refreshPreset();
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
                <div className={"flex-1 flex justify-center"}>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FolderOpenIcon/>
                            </EmptyMedia>
                            <EmptyTitle>{t("lorebook.empty_title")}</EmptyTitle>
                            <EmptyDescription>
                                {t("lorebook.empty_description")}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent className="flex-row justify-center gap-2">
                            <PresetLorebookCreateButtons refreshLorebooks={() => pager.refresh()}/>
                        </EmptyContent>
                    </Empty>
                </div> :
                <div className={"flex-1 flex flex-col p-2 gap-1"}>
                    <div className="flex gap-2 flex-row-reverse p-2">
                        <PresetLorebookCreateButtons refreshLorebooks={() => pager.refresh()}/>
                    </div>
                    <div className="flex-1 overflow-auto space-y-2 p-2">
                        {pager.data.map((data, i) =>
                            <PresetLorebookEditor key={i} entry={data}
                                                  refreshLorebooks={() => pager.refresh()}/>
                        )}
                    </div>
                    {pager.loading && <div className="w-full">
                        <Skeleton className="h-20 w-full"/>
                    </div>}
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
