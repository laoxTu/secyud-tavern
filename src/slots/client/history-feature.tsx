import {ButtonGroup} from "@/components/ui/button-group";
import {SlotFeature} from "@/slots/client/feeature-models";
import {HistoryDeleter} from "@/slots/client/features/history-deleter";
import {HistoryEditor} from "@/slots/client/features/history-editor";
import {Regenerator} from "@/slots/client/features/regenerator";
import {NavigateToBusiness} from "@/slots/client/features/navigate-to-business";
import {InputViewer} from "@/slots/client/features/input-viewer";


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