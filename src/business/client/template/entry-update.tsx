import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import React, {RefObject, useRef, useState} from "react";
import {EntryState} from "@/business/client/models";
import {Card, CardContent} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {EntryModel} from "@/business/models";
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
import {ChevronsDownIcon, ChevronsUpIcon, CopyIcon, PlayIcon, PlayOffIcon} from "lucide-react";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {DeleteDialog} from "@/components/custom/delete-dialog";

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
    const formRef = useRef<HTMLFormElement>(null);
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
            handleSuccess(t("default.delete_successfully"));
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
        <Card className={"w-full"}>
            <CardContent>
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className={"flex w-full rounded-md hover:bg-gray-100"}>
                        <CollapsibleTrigger nativeButton={false}
                                            className={"flex flex-1 cursor-pointer p-2"}
                                            render={<div/>}>
                            <p className={"my-auto"}>
                                {entry.name}
                                <span className={"px-2 text-sm text-gray-500"}>
                                        {entry.code}
                                    </span>
                            </p>
                        </CollapsibleTrigger>
                        <div className={"m-auto"}>
                            <Tooltip>
                                <TooltipTrigger onClick={handleDisable}
                                                render={<Button size={"icon"}
                                                                variant={"secondary"}/>}>
                                    {disabled ? <PlayOffIcon color={'red'}/> : <PlayIcon color={'green'}/>}
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{disabled ? t("default.disable_item") : t("default.enable_item")}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
                                <DialogTrigger render={<Tooltip/>}>
                                    <TooltipTrigger onClick={() => setCloneOpen(true)}
                                                    render={<Button size={'icon'}
                                                                    variant={'secondary'}/>}>
                                        <CopyIcon/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t("default.copy")}</p>
                                    </TooltipContent>
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
                                                    htmlFor={`${entryType}-code`}>
                                                    {t("default.code") + "*"}
                                                </FieldLabel>
                                                <Input id={`${entryType}-code`} name="code"
                                                       defaultValue={entry.code}
                                                       required/>
                                            </Field>
                                            <Field>
                                                <FieldLabel
                                                    htmlFor={`${entryType}-name`}>
                                                    {t("default.name") + "*"}
                                                </FieldLabel>
                                                <Input id={`${entryType}-name`} name="name"
                                                       defaultValue={entry.name}
                                                       required/>
                                            </Field>
                                        </FieldGroup>
                                        <DialogFooter>
                                            <Button type="submit">
                                                {t("default.copy")}
                                            </Button>
                                            <DialogClose render={<Button variant="outline"/>}>
                                                {t("default.cancel")}
                                            </DialogClose>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <DeleteDialog handleDelete={handleDelete}
                                          itemName={`${moduleName}.${entryType}`}/>
                            <CollapsibleTrigger render={<Button size={"icon"} variant={"ghost"}/>}>
                                {isOpen ? <ChevronsUpIcon/> : <ChevronsDownIcon/>}
                            </CollapsibleTrigger>
                        </div>
                    </div>
                    <CollapsibleContent render={<form action={handleUpdate} ref={formRef}/>}
                                        className={"p-1"}>
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
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
