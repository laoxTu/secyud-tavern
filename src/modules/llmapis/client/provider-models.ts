'use client'
import {Registerable} from "@/utils/register";
import React from "react";
import {LlmapiInputContext, SlotContextBase} from "@/modules/stories/client/conversation-models";
import {SlotMessageOutput} from "@/modules/models/message";

export interface LlmapiOutputContext extends SlotContextBase {
    // output is the origin output of llm chunk
    // for OpenAI, it will be { content: string, tool_calls: [], ...}
    output: any,
    // the output message to set
    message: SlotMessageOutput,
    // if stopped, this message is the last message
    stopped: boolean,
    stream: boolean,
}

export interface LlmapiInputItem {
    role: string,
    content: string,
}

export interface LlmapiProvider extends Registerable {
    component: React.ComponentType,
    getValue: (data: FormData) => any,
    generateOutput: (ctx: LlmapiOutputContext) => Promise<void>,
    generateInput: (ctx: LlmapiInputContext) => Promise<{ input: any, items: LlmapiInputItem[] }>,
}
