'use client';
import {del} from "@/client";
import {getSlotAndHistories, updateStoryHistory, useSlotContext} from "@/slots/client/models";
import {useTranslations} from "next-intl";
import React, {useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {DeleteIcon, TrashIcon} from "lucide-react";
import {useHistoryPageState, handleHistoryPageChange} from "@/slots/client/history-pager";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export function HistoryDeleter() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const ctx = useSlotContext();
    const {page} = useHistoryPageState();
    const [openRemove, setOpenRemove] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    const deleteCurrentHistory = async () => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const {page} = useHistoryPageState.getState();
            const history = histories[page.cur - 1];
            await del("/stories/{id}/entries/{entryType}/{entryId}",
                {params: {id: slot.story.id, entryType: 'history', entryId: history.id}})
            histories.splice(page.cur - 1, 1);
            await handleHistoryPageChange(ctx, {curPage: page.cur,});
        } catch (error) {
            handleError(error);
        } finally {
            setOpenDelete(false);
        }
    };

    const deleteCurrentOutput = async () => {
        try {
            const {slot, histories} = getSlotAndHistories(ctx);
            const {page} = useHistoryPageState.getState();
            let history = histories[page.cur - 1];
            console.debug(history);
            if (history.outputs.length > 0) {
                history.outputs.splice(history.outputId, 1);
            }
            if (history.outputs.length === 0 &&
                page.cur < histories.length) {
                const current = history;
                history = histories[page.cur];
                history.summary ||= current.summary;
                history.inputs = [...current.inputs, ...history.inputs];
                for (const input of current.inputs) {
                    input.variables.length = 0;
                }
                await updateStoryHistory(slot.story.id, history);
                await deleteCurrentHistory();
            } else {
                await updateStoryHistory(slot.story.id, history);
                await handleHistoryPageChange(ctx, {curPage: page.cur});
            }
        } catch (error) {
            handleError(error);
        } finally {
            setOpenRemove(false);
        }
    };

    return (<>
        <AlertDialog open={openRemove} onOpenChange={setOpenRemove}>
            <AlertDialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="destructive"
                                onClick={() => setOpenRemove(true)}
                                disabled={page.cur === 0}>
                            <DeleteIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('slot.delete_output_tip')}</p>
                    </TooltipContent>
                </Tooltip>
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

        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <AlertDialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="destructive"
                                onClick={() => setOpenDelete(true)}
                                disabled={page.cur === 0}>
                            <TrashIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('slot.delete_history_tip')}</p>
                    </TooltipContent>
                </Tooltip>
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
    </>);
}