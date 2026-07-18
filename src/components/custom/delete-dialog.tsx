import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {Trash2Icon} from "lucide-react";
import React, {useState} from "react";
import {useTranslations} from "next-intl";

interface Props {
    itemName: string;
    handleDelete: () => any;
}

export function DeleteDialog({handleDelete, itemName}: Props) {
    const t = useTranslations();
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger render={<Tooltip/>}>
                <TooltipTrigger onClick={() => setDeleteOpen(true)}
                                render={<Button size={'icon'}
                                                variant="destructive"/>}>
                    <Trash2Icon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t("default.delete")}</p>
                </TooltipContent>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t("default.delete_title", {target: t(itemName)})}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("default.delete_description", {target: t(itemName)})}
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
    )
}