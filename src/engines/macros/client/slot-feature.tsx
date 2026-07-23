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
import {Field, FieldContent, FieldLabel, FieldLegend, FieldSet} from "@/components/ui/field";
import {getSlotAndHistories, useSlotContext} from "@/modules/slots/client/models";
import {enginePlural} from "@/engines/macros/models";
import {MacroConversationCache} from "@/engines/macros/client/conversation";
import {useErrorHandler} from "@/handler/client/error";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {SlotFeature} from "@/modules/slots/client/feeature-models";


export function MacroSelector() {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const [cache, setCache] = React.useState<MacroConversationCache | null>(null);
    const ctx = useSlotContext();
    const {handleError} = useErrorHandler();

    const handleDialogOpen = () => {
        try {
            const {slot} = getSlotAndHistories(ctx);
            const cache: MacroConversationCache = slot.content[enginePlural];
            setCache(cache);
            setOpen(true);
        } catch (error) {
            handleError(error);
        }
    };
    const handleSelectChange = (key: string, index: number) => {
        try {
            const {slot} = getSlotAndHistories(ctx);
            const cache: MacroConversationCache = slot.content[enginePlural];
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
        <DialogContent className={'right-0 left-auto'} style={{height: '86%'}}>
            <form className={'flex flex-col overflow-hidden'}>
                <DialogHeader>
                    <DialogTitle>{t('macro.selector')}</DialogTitle>
                </DialogHeader>
                <div className={'overflow-auto p-2 flex-1'}>
                    {cache && Object.values(cache.macros).map(item => (
                        <FieldSet key={item.key}>
                            <FieldLegend>{item.key}</FieldLegend>
                            <RadioGroup defaultValue={item.select ?? 0}
                                        onValueChange={i => handleSelectChange(item.key, i)}
                                        className="w-fit">
                                {
                                    item.models.map((u, i) => (
                                        <Field key={i} orientation="horizontal">
                                            <RadioGroupItem value={i} id={`macro-${u.key}-${i}`}/>
                                            <FieldContent>
                                                <Tooltip>
                                                    <TooltipTrigger render={<FieldLabel
                                                        htmlFor={`macro-${u.key}-${i}`}/>}>
                                                        {u.name}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            {u.value}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </FieldContent>
                                        </Field>))
                                }
                            </RadioGroup>
                        </FieldSet>))}
                </div>
            </form>
        </DialogContent>
    </Dialog>);
}

export const macroSelectorFeature: SlotFeature = {
    id: "MacroSelectorFeature",
    component: MacroSelector,
}