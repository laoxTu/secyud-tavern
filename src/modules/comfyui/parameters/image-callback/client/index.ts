import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {EditorComponent, InputComponent} from "./editor";
import {ImageCallbackConfig} from "../model";
import {getBaseUrl} from "@/client";
import {useItemState} from "@/modules/stories/client/models";

export const imageCallback: ComfyUIParameter =
    {
        id: "image_callback",
        editorComponent: EditorComponent,
        getEditorValue({data}): ImageCallbackConfig {
            return {
                nodeId: data.get('node_id') as string,
            };
        },
        inputComponent: InputComponent,
        setInputData({entry, model}, input): void {
            const config = entry.config as ImageCallbackConfig;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                const name = `${Math.floor(Math.random() * 1000000)}`;
                inputs['target_url'] = `${getBaseUrl()}/api/stories/${useItemState.getState().model?.id}/images?name=${name}&code=${name}`;
                console.info(`comfyui callback url: ${inputs['target_url']}`);
            }
        }
    } as const;