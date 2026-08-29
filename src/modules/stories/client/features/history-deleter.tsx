'use client';
import {del, post} from "@/client";
import {useTranslations} from "next-intl";
import React, {useState} from "react";
import {useErrorHandler} from "@/handler/client/error";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {DeleteIcon, MessageCirclePlusIcon, TrashIcon} from "lucide-react";
import {useHistoryPageState} from "@/modules/stories/client/history-pager";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {slotContext} from "@/modules/stories/client/context";
import {StoryModel} from "@/modules/stories/models";
import {convertToRequire} from "@/modules/llmapis/models";
import {v4 as uuidv4} from "uuid";

export function HistoryDeleter() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const {page, setPage} = useHistoryPageState();
    const [openReopen, setOpenReopen] = useState<boolean>(false);
    const [openRemove, setOpenRemove] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    const deleteCurrentHistory = async () => {
        try {
            const {slotData: {slot, histories}, getHistory} = slotContext;
            const history = await getHistory(page.cur);
            await del("/stories/{id}/entries/{entryType}/{entryId}",
                {params: {id: slot.id, entryType: 'history', entryId: history.entryId}})
            histories.splice(page.cur - 1, 1);
            await setPage();
        } catch (error) {
            handleError(error);
        } finally {
            setOpenDelete(false);
        }
    };

    const deleteCurrentOutput = async () => {
        try {
            const {slotData: {histories}, getHistory, setHistory} = slotContext;
            let history = await getHistory(page.cur);
            if (history.outputs.length) {
                history.outputs.splice(history.outputId, 1);
                history.outputId = Math.min(
                    history.outputs.length - 1, history.outputId);
            }

            if (!history.outputs.length &&
                page.cur < histories.length) {
                const current = await getHistory(page.cur + 1);
                current.summary ||= history.summary;
                current.inputs = [...history.inputs, ...current.inputs];
                await setHistory(page.cur + 1);
                await deleteCurrentHistory();
            } else {
                await setHistory(page.cur);
                await setPage();
            }
        } catch (error) {
            handleError(error);
        } finally {
            setOpenRemove(false);
        }
    };

    const cloneStoryHistory = async (remain: boolean) => {
        try {
            const {slot} = slotContext.slotData;
            if (!remain) {
                await del("/stories/{id}", {
                    params: {
                        id: slot.id,
                    }
                });
            } else {
                slot.id = uuidv4()
            }
            await post<StoryModel>("/stories", {
                id: slot.id,
                content: slot.content,
                name: slot.name,
                requires: slot.requires,
                llmapi: convertToRequire(slot.llmapi)
            });
            window.location.href = `/stories/${slot.id}?_=${Date.now()}`;
            window.location.reload();
        } catch (e) {
            handleError(e);
        }
    }

    return (<>
        <AlertDialog open={openRemove} onOpenChange={setOpenRemove}>
            <AlertDialogTrigger render={<Tooltip/>}>
                <TooltipTrigger onClick={() => setOpenRemove(true)}
                                render={<Button variant="destructive"
                                                disabled={page.cur === 0}/>}>
                    <DeleteIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('slot.delete_output_tip')}</p>
                </TooltipContent>
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
            <AlertDialogTrigger render={<Tooltip/>}>
                <TooltipTrigger onClick={() => setOpenDelete(true)}
                                render={<Button variant="destructive"
                                                disabled={page.cur === 0}/>}>
                    <TrashIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('slot.delete_history_tip')}</p>
                </TooltipContent>
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
        <AlertDialog open={openReopen} onOpenChange={setOpenReopen}>
            <AlertDialogTrigger render={<Tooltip/>}>
                <TooltipTrigger onClick={() => setOpenReopen(true)}
                                render={<Button variant="destructive"/>}>
                    <MessageCirclePlusIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('slot.new_chat_title')}</p>
                </TooltipContent>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('slot.new_chat_title', {target: t('slot.output')})}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('slot.new_chat_description', {target: t('slot.output')})}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('default.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cloneStoryHistory(true)}
                                       variant={'default'}>
                        {t('slot.create_chat')}
                    </AlertDialogAction>
                    <AlertDialogAction onClick={() => cloneStoryHistory(false)}
                                       variant={'destructive'}>
                        {t('slot.create_chat_delete_origin')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>);
}