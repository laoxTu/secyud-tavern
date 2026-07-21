import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import { EditorComponent, InputComponent} from "./editor";
import {NumberEditorConfig} from "../model";

export const numberEditor: ComfyUIParameter =
    {
        id: "number_editor",
        component: EditorComponent,
        getEditorValue({data, entry}): NumberEditorConfig {
            return {
                nodeId: data.get('node_id') as string,
                nodeName: data.get('node_name') as string,
                defaultValue: parseInt(data.get(`number_${entry.id}`) as string),
            };
        },
        inputComponent: InputComponent,
        setInputData({data, entry}, input): void {
            const config = entry.config as NumberEditorConfig;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                inputs[config.nodeName] = parseInt(data.get(`number_${entry.id}`) as string);
            }
        }
    } as const;