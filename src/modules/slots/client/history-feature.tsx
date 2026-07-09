import {ButtonGroup} from "@/components/ui/button-group";
import {SlotFeature} from "@/modules/slots/client/feeature-models";
import {HistoryDeleter} from "@/modules/slots/client/features/history-deleter";
import {HistoryEditor} from "@/modules/slots/client/features/history-editor";
import {Regenerator} from "@/modules/slots/client/features/regenerator";
import {NavigateToBusiness} from "@/modules/slots/client/features/navigate-to-business";
import {InputViewer} from "@/modules/slots/client/features/input-viewer";


export function HistoryFeature() {
    return (
        <ButtonGroup className={"bg-white rounded-md"}>
            <HistoryDeleter/>
            <Regenerator/>
            <InputViewer/>
            <HistoryEditor/>
            <NavigateToBusiness/>
        </ButtonGroup>);
}

export const historyDefaultFeature: SlotFeature = {
    id: "HistoryFeature",
    component: HistoryFeature,
}