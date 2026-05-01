import {useTranslations} from "next-intl";
import {ChevronsDownIcon, ChevronsUpIcon, FolderOpenIcon, ReplaceIcon} from "lucide-react";
import {TabConfig} from "@/client/components/tab";
import {useErrorHandler} from "@/client/errors";
import React, {useCallback, useState} from "react";
import {del, get, post, put} from "@/client";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {Card, CardContent} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Switch} from "@/components/ui/switch";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Textarea} from "@/components/ui/textarea";
import {usePager} from "@/client/components/pager";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {usePresetContext} from "@/client/business/presets";
import {PagedResult} from "@/shared/models";
import {PaginationWrapper} from "@/client/components/pager/component";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export const tabConfigId = "regex";

function Navigation() {
    const t = useTranslations();

    return (
        <>
            <ReplaceIcon/>
            {t(`preset.${tabConfigId}`)}
        </>
    );
}

function CreateButtons({refreshList}: { refreshList: () => Promise<void> }) {
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
                pattern: "",
                replacement: "",
                target: "both",
                layerMin: -1,
                layerMax: -1,
            };
            await post("/presets/{id}/entries/{entryType}", params, {
                params: {
                    "id": preset.id,
                    "entryType": tabConfigId,
                }
            });
            setCreateOpen(false);
            await refreshList();
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
                                <Label htmlFor={`${tabConfigId}-name`}>{t("default.name") + "*"}</Label>
                                <Input id={`${tabConfigId}-name`} name="name"
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

function Editor({entry, refreshList}: { entry: any, refreshList: () => Promise<void> }) {

    const t = useTranslations();
    const {preset} = usePresetContext();
    if (!preset) {
        throw new Error("preset.not_found");
    }
    const {handleError} = useErrorHandler();
    const [isOpen, setIsOpen] = React.useState(true)
    const handleSubmit = async (data: FormData) => {
        try {
            const params: Record<string, any> = {
                name: data.get("name") as string,
                pattern: data.get("pattern") as string,
                replacement: data.get("replacement") as string,
                target: data.get("target") as string,
                layerMin: parseInt(data.get("layerMin") as string),
                layerMax: parseInt(data.get("layerMax") as string),
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
            await refreshList();
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
            await refreshList();
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
            await refreshList();
        } catch (error) {
            handleError(error);
        }
    }, [entry.id, handleError, preset.id, refreshList, t]);


    return (
        <Card className={"w-full"}>
            <CardContent>
                <Collapsible  open={isOpen} onOpenChange={setIsOpen}>
                    <div className={"flex w-full gap-4 p-1 rounded-md hover:bg-gray-100"}>
                        <CollapsibleTrigger asChild>
                            <label className={"w-full m-auto px-2"}>
                                {entry.name}
                            </label>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-2"
                             onClick={(e) => e.stopPropagation()}>
                            <Switch id={`${tabConfigId}-disabled-${entry.id}`}
                                    defaultChecked={!entry.disabled}
                                    onCheckedChange={handleDisableSet}/>
                            <Label className={"min-w-12"}
                                   htmlFor={`${tabConfigId}-disabled-${entry.id}`}>
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
                    <CollapsibleContent asChild className={"p-1"}>
                        <form action={handleSubmit}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`${tabConfigId}-name-${entry.id}`}>
                                                    {t("default.name")}
                                                </FieldLabel>
                                                <Input name="name"
                                                       id={`${tabConfigId}-name-${entry.id}`}
                                                       defaultValue={entry.name}/>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor={`${tabConfigId}-target-${entry.id}`}>
                                                    {t("regex.target")}
                                                </FieldLabel>
                                                <Select name="target" defaultValue={entry.target}>
                                                    <SelectTrigger className="w-full" id={`${tabConfigId}-target-${entry.id}`}>
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        <SelectGroup>
                                                            <SelectItem value={"both"}>
                                                                {t(`regex.target_both`)}
                                                            </SelectItem>
                                                            <SelectItem value={"input"}>
                                                                {t(`regex.target_input`)}
                                                            </SelectItem>
                                                            <SelectItem value={"output"}>
                                                                {t(`regex.target_output`)}
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        </div>
                                        <Field>
                                            <FieldLabel htmlFor={`${tabConfigId}-pattern-${entry.id}`}>
                                                {t("regex.pattern")}
                                            </FieldLabel>
                                            <Input name="pattern"
                                                   id={`${tabConfigId}-pattern-${entry.id}`}
                                                   defaultValue={entry.pattern}/>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor={`${tabConfigId}-replacement-${entry.id}`}>
                                                {t("regex.replacement")}
                                            </FieldLabel>
                                            <Textarea name="replacement"
                                                      id={`${tabConfigId}-replacement-${entry.id}`}
                                                      defaultValue={entry.replacement}/>
                                        </Field>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`${tabConfigId}-layerMin-${entry.id}`}>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            {t("regex.layer_min")}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t("regex.unlimit_description")}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FieldLabel>
                                                <Input name="layerMin"
                                                       type="number"
                                                       id={`${tabConfigId}-layerMin-${entry.id}`}
                                                       defaultValue={entry.layerMin}/>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor={`${tabConfigId}-layerMax-${entry.id}`}>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            {t("regex.layer_max")}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{t("regex.unlimit_description")}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </FieldLabel>
                                                <Input name="layerMax"
                                                       type="number"
                                                       id={`${tabConfigId}-layerMax-${entry.id}`}
                                                       defaultValue={entry.layerMax}/>
                                            </Field>
                                        </div>
                                    </FieldGroup>
                                </FieldSet>
                                <Field orientation="horizontal">
                                    <Button type="submit">{t("default.save")}</Button>
                                    <Button type="button" variant={"outline"}
                                            onClick={refreshList}>{t("default.reset")}</Button>
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
    const {preset} = usePresetContext();
    if (!preset) {
        throw new Error("preset.not_found");
    }
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


    return (
        <div className={"flex w-full h-full"}>
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
                            <CreateButtons refreshList={() => pager.refresh()}/>
                        </EmptyContent>
                    </Empty>
                </div> :
                <div className={"flex-1 flex flex-col p-2 gap-1"}>
                    <div className="flex gap-2 flex-row-reverse p-2">
                        <CreateButtons refreshList={() => pager.refresh()}/>
                    </div>
                    <div className="flex-1 overflow-auto space-y-2 p-2">
                        {pager.data.map((data, i) =>
                            <Editor key={i} entry={data}
                                    refreshList={() => pager.refresh()}/>
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