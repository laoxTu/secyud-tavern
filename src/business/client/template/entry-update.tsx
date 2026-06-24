import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import React, {useState} from "react";
import {EntryState} from "@/business/client/models";
import {Card, CardContent} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {EntryModel} from "@/business/models";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {
    AlertDialog, AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ChevronsDownIcon, ChevronsUpIcon} from "lucide-react";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";

export interface EntryUpdateProps<TEntry> {
    disableHandler: (entry: TEntry, disabled: boolean) => Promise<TEntry>;
    updateHandler: (entry: TEntry, data: FormData) => Promise<TEntry>;
    updateContent: (entry: TEntry) => React.ReactNode;
    deleteHandler: (entry: TEntry) => Promise<void>;
    cloneHandler: (entry: TEntry, data: FormData) => Promise<void>;
}

interface Props<TEntry> {
    entryState: EntryState<TEntry>;
    props: EntryUpdateProps<TEntry>;
    entry: TEntry;
}

export function EntryUpdate<TEntry extends EntryModel>(
    {
        entryState: {
            entryType,
            moduleName,
            usePagedItemsState,
        },
        props: {
            disableHandler,
            updateHandler,
            updateContent,
            deleteHandler,
            cloneHandler,
        },
        entry,
    }: Props<TEntry>) {

    const t = useTranslations();
    const {handleError, handleSuccess} = useErrorHandler();

    const [isOpen, setIsOpen] = useState(true);
    const [cloneOpen, setCloneOpen] = useState(false);
    const {fetch} = usePagedItemsState();
    const handleUpdate = async (data: FormData) => {
        try {
            await updateHandler(entry, data);
            handleSuccess(t("default.saved_successfully"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    const handleClone = async (data: FormData) => {
        try {
            await cloneHandler(entry, data);
            handleSuccess(t("default.copy_successfully"));
            await fetch();
            setCloneOpen(false);
        } catch (error) {
            handleError(error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteHandler(entry);
            handleSuccess(t("default.saved_successfully"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDisable = async (enabled: boolean) => {
        try {
            await disableHandler(entry, !enabled);
            handleSuccess(t(enabled ? "default.enable_item" : "default.disable_item"));
            await fetch();
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <Card className={"w-full"}>
            <CardContent>
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className={"flex w-full gap-4 p-1 rounded-md hover:bg-gray-100"}>
                        <CollapsibleTrigger asChild>
                            <label className={"w-full m-auto px-2 cursor-pointer"}>
                                {entry.name}
                                <span className={"px-2 text-sm text-gray-500"}>
                                    {entry.code}
                                </span>
                            </label>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-2"
                             onClick={(e) => e.stopPropagation()}>
                            <Switch id={`${entryType}-disabled-${entry.id}`}
                                    defaultChecked={!entry.disabled}
                                    onCheckedChange={handleDisable}/>
                            <Label className={"min-w-12"}
                                   htmlFor={`${entryType}-disabled-${entry.id}`}>
                                {t("default.enabled")}
                            </Label>
                        </div>
                        <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
                            <DialogTrigger asChild>
                                <Button>{t("default.copy")}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form action={handleClone}
                                      className="form-reset">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {t("default.copy_title", {target: t(`${moduleName}.${entryType}`)})}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t("default.copy_description", {target: t(`${moduleName}.${entryType}`)})}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${entryType}-code`}>{t("default.code") + "*"}</FieldLabel>
                                            <Input id={`${entryType}-code`} name="code" required/>
                                        </Field>
                                        <Field>
                                            <FieldLabel
                                                htmlFor={`${entryType}-name`}>{t("default.name") + "*"}</FieldLabel>
                                            <Input id={`${entryType}-name`} name="name" required/>
                                        </Field>
                                    </FieldGroup>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">{t("default.cancel")}</Button>
                                        </DialogClose>
                                        <Button type="submit">{t("default.copy")}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">{t("default.delete")}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t("default.delete_title", {target: t(`${moduleName}.${entryType}`)})}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t("default.delete_description", {target: t(`${moduleName}.${entryType}`)})}
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
                        <form action={handleUpdate}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field>
                                                <FieldLabel htmlFor={`${entryType}-code-${entry.id}`}>
                                                    {t("default.code")}
                                                </FieldLabel>
                                                <Input name="code"
                                                       id={`${entryType}-code-${entry.id}`}
                                                       defaultValue={entry.code}/>
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor={`${entryType}-name-${entry.id}`}>
                                                    {t("default.name")}
                                                </FieldLabel>
                                                <Input name="name"
                                                       id={`${entryType}-name-${entry.id}`}
                                                       defaultValue={entry.name}/>
                                            </Field>
                                        </div>
                                        {updateContent(entry)}
                                    </FieldGroup>
                                </FieldSet>
                                <Field orientation="horizontal">
                                    <Button type="submit">{t("default.save")}</Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
