import React from "react";
import {useTranslations} from "next-intl";
import {RotateCcwIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useHistoryPageState} from "@/modules/slots/client/history-pager";
import {useStoryChatboxState} from "@/modules/slots/client/history-chatbox";


export function Regenerator() {
    const t = useTranslations();
    const {page} = useHistoryPageState();
    return (
        <Tooltip>
            <TooltipTrigger onClick={() => useStoryChatboxState.getState().generate()}
                            render={<Button disabled={page.max === 0} variant="outline"/>}>
                <RotateCcwIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.regenerate_reply_tip')}</p>
            </TooltipContent>
        </Tooltip>);
}