import {ButtonGroup} from "@/components/ui/button-group";
import {SlotFeature} from "@/modules/slots/client/feeature-models";
import {ComfyUIGenerator} from "@/modules/comfyui/client/slot-feature/comfyui-generator";

export function ComfyuiFeature() {
    return (
        <ButtonGroup className={"bg-white rounded-md"}>
            <ComfyUIGenerator/>
        </ButtonGroup>);
}

export const comfyuiFeature: SlotFeature = {
    id: "ComfyUIFeature",
    component: ComfyuiFeature,
}