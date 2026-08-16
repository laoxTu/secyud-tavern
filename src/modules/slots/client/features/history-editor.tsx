import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {getSlotAndHistories, updateStoryHistory, useSlotContext} from "@/modules/slots/client/models";
import {handleHistoryPageChange, useHistoryPageState} from "@/modules/slots/client/history-pager";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {EditIcon} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import React, {useRef, useState} from "react";
import {StoryHistory} from "@/modules/stories/models";
import {Field, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {submitTargetFormOnKey} from "@/business/client";
import {MonacoEditor} from "@/components/custom/monaco-editor";
import {generateCurrentVariables} from "@/modules/slots/client/conversation";

export function HistoryEditor() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const ctx = useSlotContext();
    const {page} = useHistoryPageState();
    const [history, setHistory] = useState<StoryHistory | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleDialogOpen = () => {
        try {
            const {histories} = getSlotAndHistories(ctx);
            const history = histories[useHistoryPageState.getState().page.cur - 1];
            setHistory(history);
            setOpen(true);
        } catch (error) {
            handleError(error);
        }
    };

    const handleHistoryUpdate = async (data: FormData) => {
        try {
            const {histories, slot} = getSlotAndHistories(ctx);
            const index = useHistoryPageState.getState().page.cur - 1;
            const history = histories[index];
            const variablesText = data.get('variables') as string;
            try {
                history.variables = JSON.parse(variablesText);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                    toast.error(t("slot.variable_invalid_json") + '\r\n' + error.message);
                    return;
                }
            }
            for (let i = 0; i < history.inputs.length; i++) {
                const input = history.inputs[i];
                input.content = data.get(`history_input-${i}`) as string;
            }
            for (let i = 0; i < history.outputs.length; i++) {
                const outputs = history.outputs[i];
                for (let j = 0; j < outputs.length; j++) {
                    const output = outputs[j];
                    output.content = data.get(`history_output-${i}-${j}`) as string;
                }
            }
            await updateStoryHistory(slot.story.id, history);
            await handleHistoryPageChange(ctx, {curPage: page.cur})
            setOpen(false);
        } catch (e) {
            handleError(e);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <TooltipTrigger onClick={handleDialogOpen}
                            render={<Button variant="outline"
                                            disabled={page.cur === 0}/>}>
                <EditIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.edit_history_tip')}</p>
            </TooltipContent>
        </DialogTrigger>
        <DialogContent className={'flex flex-col overflow-hidden'}
                       style={{maxWidth: '86%', height: '86%'}}
                       render={<form action={handleHistoryUpdate} ref={formRef}/>}>
            {history && (
                <>
                    <DialogHeader>
                        <DialogTitle>{t('slot.edit_history')}</DialogTitle>
                    </DialogHeader>
                    <FieldSet className={'overflow-auto p-2 flex-1'}>
                        <FieldGroup className={'p-1'}>
                            <Field>
                                <FieldLabel>
                                    {t('slot.variable')}
                                </FieldLabel>
                                <MonacoEditor name={'variables'}
                                              defaultValue={JSON.stringify(history.variables)}
                                              language={'json'} formRef={formRef}/>
                                <Textarea disabled
                                          defaultValue={JSON.stringify(generateCurrentVariables(history, true))}/>
                            </Field>
                        </FieldGroup>
                        <FieldGroup className={'p-1'}>
                            {history.inputs.map((u, i) => (
                                <Field key={i}>
                                    <FieldLabel htmlFor={`history_input-${i}`}>
                                        {`${t('slot.input')} ${i}`}
                                    </FieldLabel>
                                    <Textarea defaultValue={u.content}
                                              name={`history_input-${i}`}
                                              id={`history_input-${i}`}
                                              onKeyDown={submitTargetFormOnKey}/>
                                </Field>))}
                            {history.outputs.map((u, i) => (
                                <Field key={i}>
                                    <FieldLabel className={history.outputId === i ? "text-red-600" : ""}>
                                        {`${t('slot.output')} ${i}`}
                                    </FieldLabel>
                                    {u.filter(v => !v.callings?.length || v.content).map((v, vi) =>
                                        <Textarea key={vi} defaultValue={v.content}
                                                  name={`history_output-${i}-${vi}`}
                                                  onKeyDown={submitTargetFormOnKey}/>)
                                    }
                                </Field>))}
                        </FieldGroup>
                    </FieldSet>
                    <DialogFooter>
                        <Button type="submit">
                            {t('default.save')}
                        </Button>
                        <DialogClose render={<Button variant="outline"/>}>
                            {t('default.cancel')}
                        </DialogClose>
                    </DialogFooter>
                </>)}
        </DialogContent>
    </Dialog>);
}