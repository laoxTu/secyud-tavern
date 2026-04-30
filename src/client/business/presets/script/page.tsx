import {useTranslations} from "next-intl";
import {ChevronsDownIcon, ChevronsUpIcon, FileCode2Icon, FolderOpenIcon} from "lucide-react";
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

export const tabConfigId = "script";

function Navigation() {
    const t = useTranslations();

    return (
        <>
            <FileCode2Icon/>
            {t(`preset.${tabConfigId}`)}
        </>
    );
}

function CreateButtons({refreshList}: {
    refreshList: () => Promise<void>
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
                content: "",
                priority: 100,
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

function Editor({entry, refreshList}: {
    entry: any,
    refreshList: () => Promise<void>
}) {

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
                content: data.get("content") as string,
                priority: Number(data.get("priority")),
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
                    <CollapsibleContent>
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
                                                <FieldLabel htmlFor={`${tabConfigId}-priority-${entry.id}`}>
                                                    {t("default.priority")}
                                                </FieldLabel>
                                                <Input name="priority" type={"number"}
                                                       id={`${tabConfigId}-priority-${entry.id}`}
                                                       defaultValue={entry.priority}/>
                                            </Field>
                                        </div>
                                        <Field>
                                            <FieldLabel htmlFor={`${tabConfigId}-content-${entry.id}`}>
                                                {t("default.content")}
                                            </FieldLabel>
                                            <Textarea name="content"
                                                      id={`${tabConfigId}-content-${entry.id}`}
                                                      defaultValue={entry.content}/>
                                        </Field>
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