import {Registerable, Registry} from "@/shared/register";
import {LlmInputModel} from "@/shared/business/slots";


export interface LlmRequestContext extends LlmInputModel{
    type: string,
    config: any,
    apiKey: string,
}

export interface LlmEngine extends Registerable {
    run: (context: LlmRequestContext) => Promise<ReadableStream>;
}

export class LlmEngineRegistry extends Registry<LlmEngine> {
}