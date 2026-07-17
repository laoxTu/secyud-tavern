import {Button} from "@/components/ui/button";
import {RotateCcwIcon} from "lucide-react";
import React from "react";
import {generateLlmapiReply} from "@/modules/slots/client/history-chatbox";
import {useSlotContext} from "@/modules/slots/client/models";
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useTranslations} from "next-intl";


export function Regenerator() {
    const ctx = useSlotContext();
    const t = useTranslations();
    const {page} = useHistoryPageState();
    return (
        <Tooltip>
            <TooltipTrigger onClick={() => generateLlmapiReply(ctx)}
                            render={<Button disabled={page.max === 0} variant="outline"/>}>
                <RotateCcwIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.regenerate_reply_tip')}</p>
            </TooltipContent>
        </Tooltip>);
}