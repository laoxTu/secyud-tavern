import {RequireModel} from "@/modules/presets/models";

export interface LlmTextEditorConfig {
    nodeId: string,
    nodeName: string,
    textPrompt: string,
    llmapi: RequireModel | null,
}