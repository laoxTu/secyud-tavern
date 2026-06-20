import {Button} from "@/components/ui/button";
import {RotateCcwIcon} from "lucide-react";
import {SlotFeature} from "@/slots/client/feeature-models";
import React from "react";
import {generateLlmapiReply} from "@/slots/client/history-chatbox";
import {useSlotContext} from "@/slots/client/models";
import {useHistoryPageState} from "@/slots/client/history-pager";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useTranslations} from "next-intl";


export function Regenerator() {
    const ctx = useSlotContext();
    const t = useTranslations();
    const {page} = useHistoryPageState();
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={() => generateLlmapiReply(ctx)}
                        disabled={page.max === 0} variant="outline">
                    <RotateCcwIcon/>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.regenerate_reply_tip')}</p>
            </TooltipContent>
        </Tooltip>);
}

export const regeneratorFeature: SlotFeature = {
    id: "Regenerator",
    component: Regenerator,
}