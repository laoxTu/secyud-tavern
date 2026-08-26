import {useTranslations} from "next-intl";
import React from "react";
import {LlmapiInputContext, slotUtils} from "@/modules/stories/client/conversation-models";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/modules/llmapis/models";
import {ToolConversationCache, toolUtils} from "@/engines/tools/client/conversation";
import {Selector} from "@/components/custom/selector";
import {OpenAIInputBuilderConfigModel} from "../models";
import {OpenAI} from "openai";
import {enginePlural as toolPlural} from "@/engines/tools/models";
import {LlmapiInputItem} from "@/modules/llmapis/client/provider-models";
import {filterCallings, generateMessageWithBuilder, getKnowledgeTool} from "@/modules/llmapis/client/input-builder";
import {joinAsString} from "@/utils";

/**
 * Open AI 有两个格式, chat 和 responses
 * @param context
 */
export async function generateInput(context: LlmapiInputContext) {
    const items: LlmapiInputItem[] = [];
    if (context.slot.llmapi.content.config?.format === "responses") {
        const messages: OpenAI.Responses.ResponseInputItem[] = [];
        const tools: OpenAI.Responses.Tool[] = toolUtils
            .getActiveTools(context.slot)
            .map((u) => ({
                type: "function",
                name: u.model.name,
                parameters: u.model.parameters as any,
                description: u.model.description,
                strict: false,
            }));
        tools.push({
            type: "function",
            ...getKnowledgeTool,
            parameters: {},
            strict: false,
        });
        const systemPrompts: string[] = [];
        await generateMessageWithBuilder(context, {
            builder: context.slot.llmapi.content
                .config?.inputBuilder?.type,
            toolName: i => `call_x${i}`,
            pushUserMessage: (content) => {
                items.push({content, role: "user"});
                messages.push({role: "user", content,});
            },
            pushAiMessage: (content) => {
                items.push({content, role: "assistant"});
                messages.push({role: "assistant", content,});
            },
            pushSystemMessage: (content) => {
                items.push({content, role: "system"});
                messages.push({role: "system", content,});
            },
            pushToolMessage: (callings, content, output, enableHidden) => {
                if (content) {
                    items.push({content, role: "assistant"});
                    messages.push({role: "assistant", content});
                }
                callings = filterCallings(callings, items, enableHidden);
                if (!callings.length) return;
                for (const calling of callings) {
                    messages.push({
                        type: "function_call",
                        call_id: calling.id,
                        arguments: calling.arguments,
                        name: calling.name,
                    });
                }
                for (const calling of callings) {
                    messages.push({
                        type: "function_call_output",
                        call_id: calling.id,
                        output: calling.result?.content ?? "error",
                    });
                }
            }
        });
        const instructions = joinAsString(systemPrompts, "\n");
        items.unshift({content: instructions, role: "system"});
        const input: Partial<OpenAI.Responses.ResponseCreateParams> = {
            input: messages, instructions,
            tools: tools.length > 0 ? tools : undefined,
        }
        return {
            input,
            items,
        };
    } else {
        const messages: OpenAI.ChatCompletionMessageParam[] = [];
        const tools: OpenAI.ChatCompletionTool[] = Object
            .values(slotUtils.getProperty<ToolConversationCache>(
                context.slot, toolPlural).tools)
            .map((u) => ({
                type: "function",
                function: {
                    name: u.model.name,
                    parameters: u.model.parameters as any,
                    description: u.model.description,
                }
            }));
        tools.push({
            type: "function",
            function: getKnowledgeTool
        });
        await generateMessageWithBuilder(context, {
            builder: context.slot.llmapi.content
                .config?.inputBuilder?.type,
            toolName: i => `call_x${i}`,
            pushUserMessage: (content) => {
                items.push({content, role: "user"});
                messages.push({role: "user", content,});
            },
            pushAiMessage: (content) => {
                items.push({content, role: "assistant"});
                messages.push({role: "assistant", content,});
            },
            pushSystemMessage: (content) => {
                items.push({content, role: "system"});
                messages.push({role: "system", content,});
            },
            pushToolMessage: (callings, content, message, enableHidden) => {
                if (content) items.push({content, role: "assistant"});
                callings = filterCallings(callings, items, enableHidden);
                if (!callings.length) {
                    if (content) {
                        messages.push({role: "assistant", content,});
                    }
                    return;
                }
                messages.push({
                    role: "assistant", content,
                    tool_calls: callings.map(u => ({
                        id: u.id,
                        type: "function",
                        function: {
                            arguments: u.arguments,
                            name: u.name,
                        },
                    })),
                });
                for (const calling of callings) {
                    messages.push({
                        role: "tool",
                        tool_call_id: calling.id,
                        content: calling.result?.content ?? "error",
                    });
                }
            }
        });
        const input: Partial<OpenAI.ChatCompletionCreateParams> = {
            messages,
            tools: tools.length > 0 ? tools : undefined,
        }
        return {
            input,
            items,
        };
    }
}

export function BuilderContent({config}: { config: OpenAIInputBuilderConfigModel }) {
    const t = useTranslations();

    return (
        <>
            <Field>
                <FieldLabel htmlFor={`${moduleName}-builder-type`}>
                    {t(`${moduleName}.user_input_prefix`)}
                </FieldLabel>
                <Selector id={`${moduleName}-builder-type`} name={"builder-type"}
                          items={["default", "layered"]}
                          defaultValue={config.type}/>
            </Field>
        </>
    );
}

export function getInputBuilderConfig(data: FormData) {
    const res: OpenAIInputBuilderConfigModel = {
        type: data.get('builder-type') as string,
    };
    return res;
}