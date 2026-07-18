import {ButtonGroup} from "@/components/ui/button-group";
import {SlotFeature} from "@/modules/slots/client/feeature-models";
import {ComfyUIGenerator} from "@/modules/comfyui/client/slot-feature/comfyui-generator";
import {StoryImage} from "@/modules/comfyui/client/slot-feature/story-image";

export function ComfyUIFeature() {
    return (
        <ButtonGroup className={"bg-white rounded-md"}>
            <ComfyUIGenerator/>
            <StoryImage/>
        </ButtonGroup>);
}

export const comfyuiFeature: SlotFeature = {
    id: "ComfyUIFeature",
    component: ComfyUIFeature,
}