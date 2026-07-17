import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {Config, EditorComponent, InputComponent} from "./editor";

export const textEditor: ComfyUIParameter =
    {
        id: "text_editor",
        editorComponent: EditorComponent,
        getEditorValue(data, entry): Config {
            return {
                nodeId: data.get('node_id') as string,
                nodeName: data.get('node_name') as string,
                defaultValue: data.get(`text_${entry.id}`) as string,
            };
        },
        inputComponent: InputComponent,
        setInputData(data, entry, input): void {
            const config = entry.config as Config;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                inputs[config.nodeName] = data.get(`text_${entry.id}`);
            }
        }
    } as const;