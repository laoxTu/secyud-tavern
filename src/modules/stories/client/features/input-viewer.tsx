import {useErrorHandler} from "@/handler/client/error";
import {useTranslations} from "next-intl";
import {useState} from "react";
import {ViewIcon} from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {conversationManager,} from "@/modules/stories/client/conversation";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {LlmapiInputItem} from "@/modules/llmapis/client/provider-models";
import {useStoryChatboxState} from "@/modules/stories/client/history-chatbox";
import {slotContext} from "@/modules/stories/client/context";
import {historyUtils, messageUtils, SlotHistory} from "@/modules/models";


export function InputViewer() {
    const {handleError} = useErrorHandler();
    const t = useTranslations();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<LlmapiInputItem[] | undefined>();

    const handleDialogOpen = async () => {
        setLoading(true);
        try {
            const {slotData: {slot, histories}, getHistory} = slotContext;

            const last = await getHistory();
            // 用当前输入框内容构造一个"虚拟待发历史"，追加到 histories 后走一遍真实构建流程，
            // 让用户预览这次输入实际会发给模型的上下文
            const history: SlotHistory = {
                code: "",
                disabled: false,
                entryId: 0,
                inputs: [
                    messageUtils.setContent({
                        content: "",
                        variables: [],
                        properties: {}
                    }, useStoryChatboxState.getState().content)
                ],
                name: "",
                outputId: -1,
                outputs: [],
                summary: false,
                variables: last ? historyUtils.getVariables(last, true) : {},
            };
            const virtualHistories =
                [...structuredClone(histories), history];
            console.debug(`[input-viewer](histories): `,virtualHistories);
            // 工具调用初始化，防止虚拟上下文调用工具。
            for (const virtualHistory of virtualHistories) {
                if (!virtualHistory) continue;
                for (const outputs of virtualHistory.outputs) {
                    for (const output of outputs) {
                        if (!output.callings?.length) continue;
                        for (const calling of output.callings) {
                            calling.result ??= {
                                content: "",
                                hidden: true,
                            }
                        }
                    }
                }
            }

            const {items} = await conversationManager.inputProcesser
                .processInput({
                    history, current: false,
                    slot: {...slot, histories: virtualHistories}
                });
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
                                        <span className={'w-48'}>{u.role}</span>
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
