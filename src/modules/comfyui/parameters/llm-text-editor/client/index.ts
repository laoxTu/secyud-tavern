import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import { EditorComponent, InputComponent} from "./editor";
import {LlmTextEditorConfig} from "../model";

export const llmTextEditor: ComfyUIParameter =
    {
        id: "llm_text_editor",
        component: EditorComponent,
        getEditorValue({data}): LlmTextEditorConfig {
            return {
                nodeId: data.get('node_id') as string,
                nodeName: data.get('node_name') as string,
                textPrompt: data.get(`text_prompt`) as string,
            };
        },
        inputComponent: InputComponent,
        setInputData({data, entry}, input): void {
            const config = entry.config as LlmTextEditorConfig;
            const inputs = input[config.nodeId]?.inputs;
            if (inputs) {
                inputs[config.nodeName] = data.get(`text_${entry.id}`);
            }
        }
    } as const;