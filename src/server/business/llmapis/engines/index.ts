import {Registerable, Registry} from "@/shared/register";

export interface LlmMessage {
    role: string,
    content: string,
    name?: string,
}

export interface LlmRequestContext {
    type: string,
    config: any,
    apiKey: string,
    messages: LlmMessage[],
}

export interface LlmEngine extends Registerable {
    run: (context: LlmRequestContext) => Promise<ReadableStream>;
}

export class LlmEngineRegistry extends Registry<LlmEngine> {
}