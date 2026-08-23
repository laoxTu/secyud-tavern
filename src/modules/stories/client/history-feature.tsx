import {ButtonGroup} from "@/components/ui/button-group";
import {SlotFeature} from "@/modules/stories/client/feeature-models";
import {HistoryDeleter} from "@/modules/stories/client/features/history-deleter";
import {HistoryEditor} from "@/modules/stories/client/features/history-editor";
import {Regenerator} from "@/modules/stories/client/features/regenerator";
import {NavigateToBusiness} from "@/modules/stories/client/features/navigate-to-business";
import {InputViewer} from "@/modules/stories/client/features/input-viewer";


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
    sequence: 1000,
    component: HistoryFeature,
}