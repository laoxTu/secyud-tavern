import {Button} from "@/components/ui/button";
import {RotateCcwIcon} from "lucide-react";
import {SlotFeature} from "@/slots/client/feeature-models";
import React from "react";
import {generateLlmapiReply} from "@/slots/client/history-chatbox";
import {useSlotContext} from "@/slots/client/models";
import {getStoryHistoryPage} from "@/slots/client/history-pager";

export function Regenerator() {

    const ctx = useSlotContext();
    const {max} = getStoryHistoryPage(ctx);
    return (
        <Button onClick={() => generateLlmapiReply(ctx)}
                disabled={max === 0} variant="outline">
            <RotateCcwIcon/>
        </Button>);
}

export const regeneratorFeature: SlotFeature = {
    id: "Regenerator",
    component: Regenerator,
}