import {Registerable} from "@/utils/register";
import {LlmInputModel} from "@/slots/models";

export interface LlmapiRequestContext extends LlmInputModel {
    type: string,
    config: any,
    apiKey: string,
}

export interface LlmapiEngine extends Registerable {
    run: (context: LlmapiRequestContext) => Promise<ReadableStream>;
}
