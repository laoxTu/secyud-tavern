import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {useErrorHandler} from "@/handler/client/error";
import {EntryState} from "@/business/client/models";
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
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {FilePlusIcon} from "lucide-react";

export interface EntryCreateProps<TEntry> {
    createHandler: (data: FormData) => Promise<void>,
}

interface Props<TEntry> {
    entryState: EntryState<TEntry>
    props: EntryCreateProps<TEntry>
}

export function EntryCreate<TEntry>(
    {
        entryState: {
            moduleName,
            entryType,
            usePagedItemsState,
        },
        props: {
            createHandler,
        },
    }: Props<TEntry>) {
    const t = useTranslations();
    const {handleError} = useErrorHandler();
    const [createOpen, setCreateOpen] = useState(false);
    const {fetch} = usePagedItemsState();

    const handleCreate = async (data: FormData) => {
        try {
            await createHandler(data);
            await fetch();
            setCreateOpen(false);
        } catch (error) {
            handleError(error);
        }
    };

    return (
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
                <form action={handleCreate}
                      className="form-reset">
                    <DialogHeader>
                        <DialogTitle>
                            {t("default.create_title", {target: t(`${moduleName}.${entryType}`)})}
                        </DialogTitle>
                        <DialogDescription>
                            {t("default.create_description", {target: t(`${moduleName}.${entryType}`)})}
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor={`${entryType}-code`}>{t("default.code") + "*"}</FieldLabel>
                            <Input id={`${entryType}-code`} name="code" required/>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${entryType}-name`}>{t("default.name") + "*"}</FieldLabel>
                            <Input id={`${entryType}-name`} name="name" required/>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline"/>}>
                            {t("default.cancel")}
                        </DialogClose>
                        <Button type="submit">{t("default.create")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}