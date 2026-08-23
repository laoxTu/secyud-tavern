import {ToolboxIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {useTranslations} from "next-intl";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Field, FieldContent, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {enginePlural} from "@/engines/tools/models";
import {ToolConversationCache} from "@/engines/tools/client/conversation";
import {useErrorHandler} from "@/handler/client/error";
import {SlotFeature} from "@/modules/stories/client/feeature-models";
import {Checkbox} from "@/components/ui/checkbox";
import {slotUtils} from "@/modules/stories/client/conversation-models";
import {slotContext} from "@/modules/stories/client/context";


export function ToolSelector() {
    const t = useTranslations();
    const [open, setOpen] = React.useState(false);
    const [cache, setCache] = React.useState<ToolConversationCache | null>(null);
    const {handleError} = useErrorHandler();

    const handleDialogOpen = () => {
        try {
            const {slot} = slotContext.slotData;
            const cache: ToolConversationCache = slotUtils.getProperty(slot, enginePlural);
            setCache(cache);
            setOpen(true);
        } catch (error) {
            handleError(error);
        }
    };

    return (<Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Tooltip/>}>
            <Tooltip>
                <TooltipTrigger onClick={() => open ? setOpen(false) : handleDialogOpen()}
                                render={<Button variant="outline"/>}>
                    <ToolboxIcon/>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('tool.show_selector')}</p>
                </TooltipContent>
            </Tooltip>
        </DialogTrigger>
        <DialogContent className={'flex flex-col overflow-hidden h-5/6'} style={{height: '86%'}}>
            <DialogHeader>
                <DialogTitle>{t('tool.selector')}</DialogTitle>
            </DialogHeader>
            <FieldGroup className={'overflow-auto p-2 flex-1'}>
                {cache && Object.values(cache.tools)
                    .map(u => (
                        <Field key={u.model.name}>
                            <FieldContent className={'flex-row'}>
                                <Checkbox id={`tool-${u.model.name}`}
                                          defaultChecked={!u.disabled}
                                          onCheckedChange={b => u.disabled = !b}/>
                                <FieldLabel htmlFor={`tool-${u.model.name}`}
                                            className="m-auto ml-2 flex-1">
                                    {u.model.name}
                                </FieldLabel>
                            </FieldContent>
                            <FieldDescription>
                                {u.model.description.substring(0, 32)}
                                {u.model.description.length > 32 ?
                                    <Tooltip>
                                        <TooltipTrigger
                                            className="cursor-pointer ml-2 inline-block text-center size-5 m-auto rounded-full border hover:border-primary hover:text-primary"
                                            render={<span/>}>
                                            ⋯
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{u.model.description}</p>
                                        </TooltipContent>
                                    </Tooltip> : null
                                }
                            </FieldDescription>
                        </Field>))}
            </FieldGroup>
        </DialogContent>
    </Dialog>);
}

export const toolSelectorFeature: SlotFeature = {
    id: "ToolSelectorFeature",
    component: ToolSelector,
}