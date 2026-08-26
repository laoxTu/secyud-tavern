import {useTranslations} from "next-intl";
import React from "react";
import {LlmapiInputContext} from "@/modules/stories/client/conversation-models";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/modules/llmapis/models";
import {toolUtils} from "@/engines/tools/client/conversation";
import {Selector} from "@/components/custom/selector";
import {AnthropicInputBuilderConfigModel} from "../models";
import {joinAsString, tryParseJson} from "@/utils";
import {LlmapiInputItem} from "@/modules/llmapis/client/provider-models";
import Anthropic from '@anthropic-ai/sdk';
import {filterCallings, generateMessageWithBuilder, getKnowledgeTool} from "@/modules/llmapis/client/input-builder";

// 按序拼装历史、世界书、开场白成 messages，相同角色连续消息合并压缩。
export async function generateInput(
    context: LlmapiInputContext) {
    const items: LlmapiInputItem[] = [];
    const messages: Anthropic.MessageParam[] = [];
    const tools: Anthropic.ToolUnion[] = toolUtils
        .getActiveTools(context.slot)
        .map((u) => ({
            name: u.model.name,
            input_schema: u.model.parameters as any,
            description: u.model.description,
        }));
    tools.push({
        input_schema: {
            type: 'object',
        },
        ...getKnowledgeTool
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
        pushAiMessage: (content, output) => {
            items.push({content, role: "assistant"});
            const message: Anthropic.MessageParam = output?.properties["signature"] ?
                {
                    role: "assistant", content: [
                        {type: "text", text: content},
                        {
                            type: "thinking",
                            thinking: output.thought,
                            signature: output.properties["signature"],
                        },
                    ],
                } : {role: "assistant", content,};
            messages.push(message);
        },
        pushSystemMessage: (content) => {
            systemPrompts.push(content);
        },
        pushToolMessage: (callings, content, output, enableHidden) => {
            const aiParams: Anthropic.ContentBlockParam[] = [];
            // 即便没有工具调用，思考和ai回复也要注入
            messages.push({role: "assistant", content: aiParams});
            if (content) {
                items.push({content, role: "assistant"});
                aiParams.push({type: "text", text: content});
            }
            if (output?.properties["signature"]) {
                aiParams.push({
                    type: "thinking",
                    thinking: output.thought,
                    signature: output.properties["signature"],
                });
            }
            callings = filterCallings(callings, items, enableHidden);
            if (!callings.length) return;
            const userParams: Anthropic.ContentBlockParam[] = [];
            for (const calling of callings) {
                aiParams.push({
                    type: "tool_use",
                    id: calling.id,
                    name: calling.name,
                    input: tryParseJson(calling.arguments),
                });
                userParams.push({
                    type: "tool_result",
                    tool_use_id: calling.id,
                    content: calling.result?.content ?? "error"
                });
            }
            messages.push({
                role: "user",
                content: userParams,
            });
        }
    });
    const system = joinAsString(systemPrompts, "\n");
    items.unshift({content: system, role: "system"});

    const input: Partial<Anthropic.MessageCreateParams> = {
        system, messages,
        tools: tools.length > 0 ? tools : undefined,
    }
    return {
        input,
        items,
    };
}

export function BuilderContent({config}: { config: AnthropicInputBuilderConfigModel }) {
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
    const res: AnthropicInputBuilderConfigModel = {
        type: data.get('builder-type') as string,
    };
    return res;
}