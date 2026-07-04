import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import React, {RefObject, useRef, useState} from "react";
import {EntryState} from "@/business/client/models";
import {Card, CardContent} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {EntryModel} from "@/business/models";
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
import {ChevronsDownIcon, ChevronsUpIcon, CopyIcon, PlayIcon, PlayOffIcon, Trash2Icon} from "lucide-react";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export interface EntryUpdateProps<TEntry> {
    disableHandler: (entry: TEntry, disabled: boolean) => Promise<TEntry>;
    updateHandler: (entry: TEntry, data: FormData) => Promise<TEntry>;
    updateContent: (entry: TEntry, formRef: RefObject<HTMLFormElement | null>) => React.ReactNode;
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
    const [disabled, setDisabled] = useState(entry.disabled);
    const [cloneOpen, setCloneOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [key, setKey] = useState(0);
    const formRef = useRef<HTMLFormElement>(null);
    const {fetch} = usePagedItemsState();
    const handleUpdate = async (data: FormData) => {
        try {
            await updateHandler(entry, data);
            handleSuccess(t("default.saved_successfully"));
            await fetch();
            setKey(u => u + 1);
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

    const handleDisable = async () => {
        try {
            await disableHandler(entry, !disabled);
            handleSuccess(t(disabled ? "default.enable_item" : "default.disable_item"));
            await fetch();
            setDisabled(!disabled);
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <Card className={"w-full"} key={key}>
            <CardContent>
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className={"flex w-full rounded-md hover:bg-gray-100"}>
                        <CollapsibleTrigger asChild>
                            <div className={"flex flex-1 cursor-pointer p-2"}>
                                <p className={"my-auto"}>
                                    {entry.name}
                                    <span className={"px-2 text-sm text-gray-500"}>
                                        {entry.code}
                                    </span>
                                </p>
                            </div>
                        </CollapsibleTrigger>
                        <div className={"m-auto"}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size={"icon"} variant={"secondary"}
                                            onClick={handleDisable}>
                                        {disabled ? <PlayOffIcon color={'red'}/> : <PlayIcon color={'green'}/>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{disabled ? t("default.disable_item") : t("default.enable_item")}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
                                <DialogTrigger asChild>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button size={'icon'}
                                                    onClick={() => setCloneOpen(true)}
                                                    variant={'secondary'}>
                                                <CopyIcon/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t("default.copy")}</p>
                                        </TooltipContent>
                                    </Tooltip>
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
                    </div>
                    <CollapsibleContent asChild className={"p-1"}>
                        <form action={handleUpdate} ref={formRef}>
                            <FieldGroup>
                                <FieldSet>
                                    <FieldGroup>
                                        <div className="grid md:grid-cols-2 gap-4">
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
                                        {updateContent(entry, formRef)}
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
