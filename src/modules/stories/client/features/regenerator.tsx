import React from "react";
import {useTranslations} from "next-intl";
import {RotateCcwIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useHistoryPageState} from "@/modules/stories/client/history-pager";
import {useStoryChatboxState} from "@/modules/stories/client/history-chatbox";
import {useErrorHandler} from "@/handler/client/error";


export function Regenerator() {
    const t = useTranslations();
    const {page,} = useHistoryPageState();
    const {handleError} = useErrorHandler();

    const regenerate = async () => {
        try {
            const {generate} = useStoryChatboxState.getState();
            await generate();
        } catch (err) {
            handleError(err);
        }
    }
    return (
        <Tooltip>
            <TooltipTrigger onClick={regenerate}
                            render={<Button disabled={page.max === 0} variant="outline"/>}>
                <RotateCcwIcon/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('slot.regenerate_reply_tip')}</p>
            </TooltipContent>
        </Tooltip>);
}