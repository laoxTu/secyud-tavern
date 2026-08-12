import {Registerable} from "@/utils/register";

export interface LlmapiRequestContext {
    type: string,
    config: any,
    signal: AbortSignal,
    apiKey: string,
    input: any,
}

export interface LlmapiProvider extends Registerable {
    run: (context: LlmapiRequestContext) => Promise<ReadableStream>;
}
