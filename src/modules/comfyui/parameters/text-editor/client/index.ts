import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {EditorComponent, InputComponent} from "./editor";
import {TextEditorConfig} from "../model";

export const textEditor: ComfyUIParameter =
    {
        id: "text_editor",
        component: EditorComponent,
        getEditorValue({data, entry}): TextEditorConfig {
            return {
                nodeId: data.get('node_id') as string,
                nodeName: data.get('node_name') as string,
                defaultValue: data.get(`text_${entry.id}`) as string,
            };
        },
        inputComponent: InputComponent,
        setInputData({data, entry}, input): void {
            const config = entry.config as TextEditorConfig;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                inputs[config.nodeName] = data.get(`text_${entry.id}`);
            }
        }
    } as const;