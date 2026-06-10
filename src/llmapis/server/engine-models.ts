import {Registerable} from "@/utils/register";
import {LlmapiInputModel} from "@/slots/models";

export interface LlmapiRequestContext extends LlmapiInputModel {
    type: string,
    config: any,
    apiKey: string,
}

export interface LlmapiEngine extends Registerable {
    run: (context: LlmapiRequestContext) => Promise<ReadableStream>;
}
