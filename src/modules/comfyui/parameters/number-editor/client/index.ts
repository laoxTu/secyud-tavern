import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {Config, EditorComponent, InputComponent} from "./editor";

export const numberEditor: ComfyUIParameter =
    {
        id: "number_editor",
        editorComponent: EditorComponent,
        getEditorValue(data, entry): Config {
            return {
                nodeId: data.get('node_id') as string,
                nodeName: data.get('node_name') as string,
                defaultValue: parseInt(data.get(`number_${entry.id}`) as string),
            };
        },
        inputComponent: InputComponent,
        setInputData(data, entry, input): void {
            const config = entry.config as Config;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                inputs[config.nodeName] = parseInt(data.get(`number_${entry.id}`) as string);
            }
        }
    } as const;