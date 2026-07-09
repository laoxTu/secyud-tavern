import {Registerable} from "@/utils/register";
import {LlmapiInputModel} from "@/modules/slots/models";

export interface LlmapiRequestContext extends LlmapiInputModel {
    type: string,
    config: any,
    signal: AbortSignal,
    apiKey: string,
}

export interface LlmapiEngine extends Registerable {
    run: (context: LlmapiRequestContext) => Promise<ReadableStream>;
}
