import {ListIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {useTranslations} from "next-intl";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet} from "@/components/ui/field";
import {getSlotAndHistories, useSlotContext} from "@/modules/slots/client/models";
import {getContent} from "@/modules/slots/client/conversation-models";
import {enginePlural} from "@/engines/macros/models";
import {MacroConversationCache} from "@/engines/macros/client/conversation";
import {useErrorHandler} from "@/handler/client/error";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {SlotFeature} from "@/modules/slots/client/feeature-models";
import {Separator} from "@/components/ui/separator";
import {Checkbox} from "@/components/ui/checkbox";


export function MacroSelector() {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const [cache, setCache] = React.useState<MacroConversationCache | null>(null);
    const ctx = useSlotContext();
    const {handleError} = useErrorHandler();

    const handleDialogOpen = () => {
        try {
            const {slot} = getSlotAndHistories(ctx);
            const cache: MacroConversationCache = getContent(slot, enginePlural);
            setCache(cache);
            setOpen(true);
        } catch (error) {
            handleError(error);
        }
    };
    const handleSelectChange = (key: string, index: number) => {
        try {
            const {slot} = getSlotAndHistories(ctx);
            const cache: MacroConversationCache = getContent(slot, enginePlural);
            const item = cache.macros[key];
            item.select = index;
            setCache(cache);
        } catch (error) {
            handleError(error);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <Tooltip>
                <TooltipTrigger onClick={() => open ? setOpen(false) : handleDialogOpen()}
                                render={<Button variant="outline"/>}>
                    <ListIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('macro.show_selector')}</p>
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent className={'flex flex-col overflow-hidden h-5/6'} style={{height: '86%'}}>
            <DialogHeader>
                <DialogTitle>{t('macro.selector')}</DialogTitle>
            </DialogHeader>
            <div className={'overflow-auto p-2 flex-1'}>
                {cache && Object.values(cache.macros)
                    .filter(u => !u.hidden)
                    .map(item => (
                        <FieldSet key={item.key}
                                  className="border rounded-lg bg-card/50 p-4">
                            <FieldLegend className="text-sm font-semibold mb-2">
                                {item.key}
                            </FieldLegend>
                            <RadioGroup defaultValue={item.select ?? 0}
                                        onValueChange={i => handleSelectChange(item.key, i)}
                                        className="flex flex-col gap-1">
                                {
                                    item.singles.map((u, i) => (
                                        <Field key={i}>
                                            {i > 0 ? <Separator className={'my-1'}/> : null}
                                            <FieldContent className="flex-row p-2">
                                                <RadioGroupItem value={i} id={`macro-${u.key}-${i}`}/>
                                                <FieldLabel htmlFor={`macro-${u.key}-${i}`}
                                                            className="m-auto ml-2 flex-1">
                                                    {u.name}
                                                </FieldLabel>
                                            </FieldContent>
                                            <FieldDescription>
                                                {u.value.substring(0, 32)}
                                                {u.value?.length > 32 ?
                                                    <Tooltip>
                                                        <TooltipTrigger
                                                            className="cursor-pointer ml-2 inline-block text-center size-5 m-auto rounded-full border hover:border-primary hover:text-primary"
                                                            render={<span/>}>
                                                            ⋯
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{u.value}</p>
                                                        </TooltipContent>
                                                    </Tooltip> : null
                                                }
                                            </FieldDescription>
                                        </Field>))
                                }
                            </RadioGroup>
                            {
                                item.multiples.map((u, i) => (
                                    <Field key={i}>
                                        {i > 0 ? <Separator className={'my-1'}/> : null}
                                        <FieldContent
                                            className="flex-row p-2 rounded-md hover:bg-primary-foreground">
                                            <Checkbox defaultChecked={!u.disabled}
                                                      onCheckedChange={b => u.disabled = !b}/>
                                            <FieldLabel htmlFor={`macro-${u.key}-${i}`}
                                                        className="m-auto ml-2 flex-1">
                                                {u.name}
                                            </FieldLabel>
                                        </FieldContent>
                                        <FieldDescription>
                                            {u.value.substring(0, 32)}
                                            {u.value?.length > 32 ?
                                                <Tooltip>
                                                    <TooltipTrigger
                                                        className="cursor-pointer ml-2 inline-block text-center size-5 m-auto rounded-full border hover:border-primary hover:text-primary"
                                                        render={<span/>}>
                                                        ⋯
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{u.value}</p>
                                                    </TooltipContent>
                                                </Tooltip> : null
                                            }
                                        </FieldDescription>
                                    </Field>))
                            }
                        </FieldSet>))}
            </div>
        </DialogContent>
    </Dialog>);
}

export const macroSelectorFeature: SlotFeature = {
    id: "MacroSelectorFeature",
    component: MacroSelector,
}