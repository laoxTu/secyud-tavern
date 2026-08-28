import {Registerable} from "@/utils/register";

export interface LlmapiRequestContext {
    signal: AbortSignal,
    type: string,
    config: any,
    apiKey: string,
    input: any,
}

export interface LlmapiProvider extends Registerable {
    run(context: LlmapiRequestContext, stream: boolean): Promise<AsyncIterable<any> | Record<string, any>>,
}
