import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {EditorComponent, InputComponent} from "./editor";
import {SelectorConfig} from "../model";

export const selector: ComfyUIParameter =
    {
        id: "selector",
        component: EditorComponent,
        getEditorValue({data}): SelectorConfig {
            return {
                nodeId: data.get('node_id') as string,
                nodeName: data.get('node_name') as string,
                defaultValue: data.get(`value_default`) as string,
                items: Array.from({length: parseInt(data.get('value_count') as string)},
                    (_, index) => (data.get(`value_${index}`) as string))
            };
        },
        inputComponent: InputComponent,
        setInputData({data, entry}, input): void {
            const config = entry.config as SelectorConfig;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                inputs[config.nodeName] = data.get(`value_${entry.id}`);
            }
        }
    } as const;