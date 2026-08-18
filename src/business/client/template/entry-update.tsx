import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import React, {RefObject, useRef, useState} from "react";
import {EntryState} from "@/business/client/models";
import {Card} from "@/components/ui/card";
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
import {GridField} from "@/components/custom/GridField";

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
        <Collapsible className={"flex-row overflow-clip"}
                     render={<Card/>}
                     open={isOpen} onOpenChange={setIsOpen}>
            <div className={"flex flex-col w-12 p-2"}>
                <Button size={"icon"} variant={"ghost"}
                        className={"m-auto"}
                        onClick={() => setIsOpen(u => !u)}>
                    {isOpen ? <ChevronsUpIcon/> : <ChevronsDownIcon/>}
                </Button>
                <CollapsibleTrigger nativeButton={false} render={<div/>}
                                    className={"flex-1 overflow-hidden rounded-md  cursor-pointer hover:bg-gray-100"}>
                    <p className={"flex-1 text-xs px-2 m-auto"} style={{
                        writingMode: "vertical-lr"
                    }}>
                        {entry.name}
                        <span className={"px-2 text-gray-500"}>
                            {entry.code}
                        </span>
                    </p>
                </CollapsibleTrigger>
                <div className={"flex flex-col m-auto"}>
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
                        <DialogContent render={<form action={handleClone}/>}>
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
                                           defaultValue={entry.code ?? ""}
                                           required/>
                                </Field>
                                <Field>
                                    <FieldLabel
                                        htmlFor={`${entryType}-name`}>
                                        {t("default.name") + "*"}
                                    </FieldLabel>
                                    <Input id={`${entryType}-name`} name="name"
                                           defaultValue={entry.name ?? ""}
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
                        </DialogContent>
                    </Dialog>
                    <DeleteDialog handleDelete={handleDelete}
                                  itemName={`${moduleName}.${entryType}`}/>
                </div>
            </div>
            <CollapsibleContent render={<form action={handleUpdate} ref={formRef}/>}
                                className={"p-1 h-full"}
                                style={{
                                    width: "72vw"
                                }}>
                <FieldGroup className={'flex flex-col h-full'}>
                    <FieldSet className={'flex-1 overflow-y-auto'}>
                        <FieldGroup>
                            <GridField>
                                {updateContent(entry, formRef)}
                            </GridField>
                        </FieldGroup>
                    </FieldSet>
                    <Field orientation="horizontal">
                        <Button type="submit">{t("default.save")}</Button>
                    </Field>
                </FieldGroup>
            </CollapsibleContent>
        </Collapsible>
    );
}
