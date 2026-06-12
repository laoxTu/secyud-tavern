'use client';
import {del} from "@/client";
import {useSlotContext} from "@/slots/client/models";
import {useTranslations} from "next-intl";
import React, {useCallback} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {DeleteIcon, Trash2Icon} from "lucide-react";


export function HistoryDeleter() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const ctx = useSlotContext();

    const deleteCurrentHistory = useCallback(async () => {
        const curPage = ctx.current.curPage;
        const slot = ctx.current.slot!;
        const histories = slot.story.histories!;
        const history = histories[curPage - 1];
        try {
            await del("/stories/{id}/entries/{entryType}/{entryId}",
                {params: {id: slot.story.id, entryType: 'history', entryId: history.id}})
            histories.splice(curPage - 1, 1);
        } catch (error) {
            handleError(error);
        }
        await ctx.current.changeCurPage!(curPage);
    }, [handleError]);

    const deleteCurrentOutput = useCallback(async () => {
        const curPage = ctx.current.curPage;
        const slot = ctx.current.slot!;
        const histories = slot.story.histories!;
        let history = histories[curPage - 1];
        console.debug(history);
        if (history.outputs.length > 0) {
            history.outputs.splice(history.outputId, 1);
        }
        if (history.outputs.length === 0 &&
            curPage < histories.length) {
            const current = history;
            history = histories[curPage];
            history.summary ||= current.summary;
            history.inputs = [...current.inputs, ...history.inputs];
            for (const input of current.inputs) {
                input.variables.length = 0;
            }
            await ctx.current.updateHistory!(history);
            await deleteCurrentHistory();
        } else {
            await ctx.current.updateHistory!(history);
            await ctx.current.changeCurPage!(curPage);
        }
    }, [deleteCurrentHistory]);

    return (<>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"
                        disabled={ctx.current.curPage === 0}>
                    <Trash2Icon/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('default.delete_title', {target: t('slot.current_history')})}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('default.delete_description', {target: t('slot.current_history')})}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('default.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCurrentHistory()}
                                       variant={'destructive'}>
                        {t('default.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive"
                        disabled={ctx.current.curPage === 0}>
                    <DeleteIcon/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('default.delete_title', {target: t('slot.output')})}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('default.delete_description', {target: t('slot.output')})}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('default.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteCurrentOutput()}
                                       variant={'destructive'}>
                        {t('default.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>);
}