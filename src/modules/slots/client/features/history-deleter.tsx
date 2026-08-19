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
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useRouter} from "next/navigation";
import {useSlotState} from "@/modules/slots/client/models";

export function HistoryDeleter() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const {page, setPage} = useHistoryPageState();
    const router = useRouter();
    const [openReopen, setOpenReopen] = useState<boolean>(false);
    const [openRemove, setOpenRemove] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    const deleteCurrentHistory = async () => {
        const {slot, histories, getHistory} = useSlotState.getState();
        if (!slot || !histories) {
            console.error('[slot]: failed to get slot');
            return;
        }
        try {
            const history = getHistory(page.cur);
            await del("/stories/{id}/entries/{entryType}/{entryId}",
                {params: {id: slot.id, entryType: 'history', entryId: history.id}})
            histories.splice(page.cur - 1, 1);
            await setPage();
        } catch (error) {
            handleError(error);
        } finally {
            setOpenDelete(false);
        }
    };

    const deleteCurrentOutput = async () => {
        const {slot, histories, getHistory, setHistory} = useSlotState.getState();
        if (!slot || !histories) {
            console.error('[slot]: failed to get slot');
            return;
        }
        try {
            let history = getHistory(page.cur);
            if (history.outputs.length) {
                history.outputs.splice(history.outputId, 1);
                history.outputId = Math.min(
                    history.outputs.length - 1, history.outputId);
            }

            if (!history.outputs.length &&
                page.cur < histories.length) {
                const current = histories[page.cur];
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
            const {slot} = useSlotState.getState();
            if (!slot) return;
            const llmapi = slot.llmapi;
            const {id} = await post("/stories", {
                ...slot,
                llmapi: {
                    code: llmapi.code,
                    name: llmapi.name,
                    author: llmapi.content.author,
                    version: llmapi.version,
                },
                presets: undefined,
                histories: undefined,
                content: {},
                id: "",
            });
            if (!remain) {
                await del("/stories/{id}", {
                    params: {
                        id: slot.id,
                    }
                })
            }
            router.push(`/business/stories/${id}`);
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