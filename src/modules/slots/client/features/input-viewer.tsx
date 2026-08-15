import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {getCurrentHistory, getSlotAndHistories, useSlotContext} from "@/modules/slots/client/models";
import {useState} from "react";
import {
    Dialog, DialogClose,
    DialogContent, DialogFooter, DialogHeader, DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {ViewIcon} from "lucide-react";
import {LlmapiInputContext} from "@/modules/slots/client/conversation-models";
import {
    conversationManager,
    generateCurrentVariables,
    generateInputBuildContext
} from "@/modules/slots/client/conversation";
import {StoryHistory} from "@/modules/stories/models";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {extractVariableChanges} from "@/modules/slots/models";
import {LlmapiInputItem} from "@/modules/llmapis/client/provider-models";
import {llmapiProviderRegistry} from "@/modules/llmapis/client/provider";


export function InputViewer() {

    const {handleError} = useErrorHandler();
    const t = useTranslations();
    const ctx = useSlotContext();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<LlmapiInputItem[] | undefined>();

    const handleDialogOpen = async () => {
        try {
            setLoading(true);
            const {slot, histories} = getSlotAndHistories(ctx);
            const apiConfig = llmapiProviderRegistry.records[slot.llmapi.provider!];
            const last = getCurrentHistory(slot);
            // 用当前输入框内容构造一个"虚拟待发历史"，追加到 histories 后走一遍真实构建流程，
            // 让用户预览这次输入实际会发给模型的上下文
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
                outputId: -1,
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
                contentHandlers: [],
                histories: [],
                config: slot.llmapi.content.config,
                current: false
            };

            generateInputBuildContext(inputContext);

            await conversationManager.inputProcesser.use(provider =>
                provider.onProcessInput(inputContext));
            const {items} = await apiConfig.generateInput(inputContext);
            setItems(items);
            setOpen(true);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <TooltipTrigger onClick={handleDialogOpen}
                            render={<Button variant="outline"/>}>
                <ViewIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.input_viewer_tip')}</p>
            </TooltipContent>
        </DialogTrigger>
        <DialogContent className={'flex flex-col overflow-hidden'}
                       style={{maxWidth: '86%', height: '86%'}}>
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
                    <div className={'overflow-auto p-2 flex-1'}>
                        <p>{`${t('default.total_chars')}: ${items?.reduce(
                            (acc, cur) => acc + cur.content.length, 0) ?? 0}`}</p>
                        <Accordion multiple>
                            {items && items.map((u, i) => (
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
                <DialogClose render={<Button variant="outline"/>}>
                    {t('default.cancel')}
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}
