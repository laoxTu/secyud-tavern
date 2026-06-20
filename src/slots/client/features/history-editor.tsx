import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {getSlotAndHistories, updateStoryHistory, useSlotContext} from "@/slots/client/models";
import {handleHistoryPageChange, useHistoryPageState} from "@/slots/client/history-pager";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {EditIcon} from "lucide-react";
import {SlotFeature} from "@/slots/client/feeature-models";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useCallback, useState} from "react";
import {StoryHistory} from "@/stories/models";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";


export function HistoryEditor() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const ctx = useSlotContext();
    const {page} = useHistoryPageState();
    const [history, setHistory] = useState<StoryHistory | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);
    const handleDialogOpen = useCallback((open: boolean) => {
        try {
            if (open) {
                const {histories} = getSlotAndHistories(ctx);
                const history = histories[useHistoryPageState.getState().page.cur - 1];
                setHistory(history);
            }
            setOpen(open);
        } catch (error) {
            handleError(error);
        }
    }, []);

    const handleHistoryUpdate = useCallback(async (data: FormData) => {
        try {
            console.debug('[HistoryEditor] open edit dialog')
            const {histories, slot} = getSlotAndHistories(ctx);
            const index = useHistoryPageState.getState().page.cur - 1;
            const history = histories[index];
            for (let i = 0; i < history.inputs.length; i++) {
                const input = history.inputs[i];
                input.content = data.get(`history_input-${i}`) as string;
            }
            for (let i = 0; i < history.outputs.length; i++) {
                const output = history.outputs[i];
                output.content = data.get(`history_output-${i}`) as string;
            }
            await updateStoryHistory(slot.story.id, history);
            await handleHistoryPageChange(ctx, {curPage: page.cur})
        } catch (e) {
            handleError(e);
        }

        handleDialogOpen(false);
    }, []);

    return (<Dialog open={open} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline"
                            disabled={page.cur === 0}
                            onClick={() => handleDialogOpen(true)}>
                        <EditIcon/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('slot.edit_history_tip')}</p>
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent className={'w-11/12'}>
            {history && (
                <form action={handleHistoryUpdate}>
                    <DialogHeader>
                        <DialogTitle>{t('slot.edit_history')}</DialogTitle>
                    </DialogHeader>
                    <FieldSet>
                        <FieldGroup className={'max-h-[50vh] overflow-y-auto'}>
                            {history.inputs.map((u, i) => (
                                <Field key={i}>
                                    <FieldLabel htmlFor={`history_input-${i}`}>
                                        {`${t('slot.input')} ${i}`}
                                    </FieldLabel>
                                    <Textarea defaultValue={u.content}
                                              name={`history_input-${i}`}
                                              id={`history_input-${i}`}/>
                                </Field>))}
                        </FieldGroup>
                        <FieldGroup className={'max-h-[50vh] overflow-y-auto'}>
                            {history.outputs.map((u, i) => (
                                <Field key={i}>
                                    <FieldLabel htmlFor={`history_output-${i}`}
                                                className={history.outputId === i ? "text-red-600" : ""}>
                                        {`${t('slot.output')} ${i}`}
                                    </FieldLabel>
                                    <Textarea defaultValue={u.content}
                                              name={`history_output-${i}`}
                                              id={`history_output-${i}`}/>
                                </Field>))}
                        </FieldGroup>
                    </FieldSet>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">
                                {t('default.cancel')}
                            </Button>
                        </DialogClose>
                        <Button type="submit">{t('default.save')}</Button>
                    </DialogFooter>
                </form>)}
        </DialogContent>
    </Dialog>);
}

export const historyEditorFeature: SlotFeature = {
    id: "HistoryEditor",
    component: HistoryEditor,
}