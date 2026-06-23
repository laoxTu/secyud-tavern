import {SlotFeature} from "@/slots/client/feeature-models";
import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {getSlotAndHistories, useSlotContext} from "@/slots/client/models";
import {useCallback, useState} from "react";
import {
    Dialog, DialogClose,
    DialogContent, DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {ViewIcon} from "lucide-react";
import {LlmapiInputContext} from "@/slots/client/conversation-models";
import {conversationManager, generateCurrentVariables, generateInputBuildContext} from "@/slots/client/conversation";
import {tryGetLastItem} from "@/utils";
import {extractVariableChanges, StoryHistory} from "@/stories/models";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";


export function InputViewer() {

    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const ctx = useSlotContext();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [inputContext, setInputContext] = useState<LlmapiInputContext | undefined>();


    const handleDialogOpen = useCallback(async (open: boolean) => {

        if (open) {
            try {
                setLoading(true);
                const {slot, histories} = getSlotAndHistories(ctx);
                const last = tryGetLastItem(histories);
                const history: StoryHistory = {
                    code: "",
                    disabled: false,
                    id: 0,
                    inputs: [{
                        id: 0,
                        content: "",
                        variables: [],
                        properties: {}
                    }],
                    name: "",
                    outputId: 0,
                    outputs: [],
                    summary: false,
                    variables: last ? generateCurrentVariables(last, true) : {},
                };
                const inputElement = document.getElementById('slot-user-input') as HTMLInputElement;
                extractVariableChanges(history.inputs[0], inputElement?.value);
                const inputContext: LlmapiInputContext = {
                    slot: {
                        ...slot,
                        story: {
                            ...slot.story,
                            histories: [...histories, history]
                        }
                    },
                    content: {},
                    history,
                    histories: [],
                    messages: [],
                };

                generateInputBuildContext(inputContext);

                await conversationManager.inputProcesser.use(provider =>
                    provider.onProcessInput(inputContext));

                console.debug("input context", inputContext);
                setInputContext(inputContext);
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        }
        setOpen(open);
    }, []);

    return (<Dialog open={open} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline"
                            onClick={() => handleDialogOpen(true)}>
                        <ViewIcon/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('slot.input_viewer_tip')}</p>
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('slot.input_viewer')}</DialogTitle>
            </DialogHeader>
            {
                loading ? <Card className="w-full max-w-xs">
                        <CardHeader>
                            <Skeleton className="h-4 w-2/3"/>
                            <Skeleton className="h-4 w-1/2"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="aspect-video w-full"/>
                        </CardContent>
                    </Card> :
                    <div className={'overflow-y-auto scrollbar-thin max-h-96'}>
                        <p>{`${t('default.total_chars')}: ${inputContext?.messages?.reduce(
                            (acc, cur) => acc + cur.content.length, 0) ?? 0}`}</p>
                        <Accordion type="multiple">
                            {inputContext && inputContext.messages.map((u, i) => (
                                <AccordionItem value={`${i}`} key={i}>
                                    <AccordionTrigger>
                                        <span className={'w-32'}>{u.role}</span>
                                        <span>
                                            {`${t("default.chars")}: ${u.content.length}`}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className={'h-full'}>
                                        <pre className={'text-wrap'}>
                                            {u.content}
                                        </pre>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
            }
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">
                        {t('default.cancel')}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

export const inputViewerFeature: SlotFeature = {
    id: "InputViewer",
    component: InputViewer,
}