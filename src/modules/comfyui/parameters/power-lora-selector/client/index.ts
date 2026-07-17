import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {Config, EditorComponent, InputComponent} from "./editor";

export const powerLoraSelector: ComfyUIParameter =
    {
        id: "power_lora_selector",
        editorComponent: EditorComponent,
        getEditorValue(data, entry): Config {
            return {
                nodeId: data.get('node_id') as string,
                defaultValue: Array.from({length: parseInt(data.get(`count_${entry.id}`) as string)},
                    (_, i) => ({
                        lora: data.get(`lora_${entry.id}_${i}`) as string,
                        strength: parseFloat(data.get(`lora_strength_${entry.id}_${i}`) as string),
                        on: Boolean(data.get(`lora_on_${entry.id}_${i}`))
                    })),
            };
        },
        inputComponent: InputComponent,
        setInputData(data, entry, input): void {
            const config = entry.config as Config;
            const inputs = input[config.nodeId]?.inputs;
            if (!inputs) return;
            const count = parseInt(data.get(`count_${entry.id}`) as string);
            for (let i = 0; i < 10; i++) {
                if (i < count) {
                    inputs[`lora_${i + 1}`] = {
                        lora: data.get(`lora_${entry.id}_${i}`) as string,
                        strength: parseFloat(data.get(`lora_strength_${entry.id}_${i}`) as string),
                        on: Boolean(data.get(`lora_on_${entry.id}_${i}`))
                    };
                } else {
                    delete inputs[`lora_${i + 1}`];
                }
            }
        }
    } as const;