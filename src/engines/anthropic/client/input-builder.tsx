import {useTranslations} from "next-intl";
import React from "react";
import {compareLorebook, enginePlural as lorebookPlural, PresetLorebookModel} from "@/engines/lorebooks/models";
import {LlmapiHistory, LlmapiInputContext, slotUtils} from "@/modules/slots/client/conversation-models";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/modules/llmapis/models";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";
import {fillToolCallContent, ToolConversationCache} from "@/engines/tools/client/conversation";
import {Selector} from "@/components/custom/selector";
import {AnthropicInputBuilderConfigModel} from "../models";
import {joinAsString, sequenceGroupBy, tryParseJson} from "@/utils";
import {enginePlural as toolPlural} from "@/engines/tools/models";
import {LlmapiInputItem} from "@/modules/llmapis/client/provider-models";
import {historyUtils} from "@/modules/models";
import {SlotMessageOutput} from "@/modules/models/message";
import Anthropic from '@anthropic-ai/sdk';

const virtualTool: Anthropic.ToolUnion = {
    name: "getLorebook",
    description: "get lorebook. return empty if current lorebook is requested. ",
    input_schema: {
        type: 'object',
    }
}

// 按序拼装历史、世界书、开场白成 messages，相同角色连续消息合并压缩。
export async function generateInput(
    {histories, slot, current, contentHandlers}: LlmapiInputContext) {
    const messages: Anthropic.MessageParam[] = [];
    const visitedLorebooks = new Set<string>();
    const entries = slotUtils.getContent<LorebookConversationCache>(slot, lorebookPlural);
    const tools: Anthropic.ToolUnion[] = Object
        .values(slotUtils.getContent<ToolConversationCache>(slot, toolPlural).tools)
        .map((u) => ({
            name: u.model.name,
            input_schema: u.model.parameters as any,
            description: u.model.description,
        }));
    tools.push(virtualTool);
    const items: LlmapiInputItem[] = [];
    const builder: string = slot.llmapi.content.config?.inputBuilder?.type;
    let simCount = 0;
    const systemPrompts: string[] = [];

    switch (builder) {
        case "layered":
            let lorebooks: PresetLorebookModel[] = [...entries.before, ...entries.after];
            fillLorebooks(lorebooks, histories.map(u => u.content[lorebookPlural]))

            for (let i = 0; i < histories.length; i++) {
                const history = histories[i];
                await pushInputs(history);
                const index = lorebooks.findIndex(
                    u => u.layer + histories.length >= i + 100);
                const splitIndex = index < 0 ? lorebooks.length : index;
                const items = lorebooks.slice(0, splitIndex);
                lorebooks = lorebooks.slice(splitIndex);
                await pushLorebooks(items);
                if (i < histories.length - 1 || current)
                    await pushOutputs(history);
            }
            break;
        default:
            for (let i = 0; i < histories.length; i++) {
                const history = histories[i];
                // 这里是api history 缓存，和message的properties不是同一实例
                const lorebooks = history.content[lorebookPlural] as PresetLorebookModel[];
                if (i === 0)
                    fillLorebooks(lorebooks, [entries.before]);
                else if (i === histories.length - 1)
                    fillLorebooks(lorebooks, [entries.after]);

                const index = lorebooks
                    .findIndex(u => u.layer >= 100);
                const splitIndex = index < 0 ? lorebooks.length : index;

                // 添加user前世界书
                await pushLorebooks(lorebooks.slice(0, splitIndex))

                await pushInputs(history);

                // 添加user后世界书
                await pushLorebooks(lorebooks.slice(splitIndex, lorebooks.length))

                if (i < histories.length - 1 || current)
                    await pushOutputs(history);
            }
            break;
    }

    const input: Partial<Anthropic.MessageCreateParams> = {
        system: joinAsString(systemPrompts, "\n"),
        messages,
        tools: tools.length > 0 ? tools : undefined,
    }
    return {
        input,
        items,
    };

    function fillLorebooks(lorebooks: PresetLorebookModel[], groups: PresetLorebookModel[][]) {
        for (const group of groups) {
            for (const item of group) {
                lorebooks.push(item);
            }
        }
        lorebooks.sort(compareLorebook);
    }

    async function pushInputs(history: LlmapiHistory) {
        if (history.inputs.length) {
            const input = joinAsString(history.inputs, "\r\n", u => u.content);
            const content = await generateContent(input, "user", "input");
            items.push({content, role: "user"});
            messages.push({role: "user", content,});
        }
    }

    async function pushOutputs(history: LlmapiHistory) {
        const outputs = historyUtils.getOutputs(history);
        if (outputs) {
            for (const output of outputs) {
                await pushOutput(output);
            }
        }
    }

    async function pushOutput(output: SlotMessageOutput, toolRole = "tool") {
        const content = await generateContent(output.content, "assistant", "output");
        // 检验工具是否触发
        await fillToolCallContent(slot, output.callings);
        if (!content && !output.callings?.some(
            u => !u.result?.hidden))
            return;
        if (content)
            items.push({content, role: "assistant"});
        const message: Anthropic.MessageParam = {
            role: "assistant",
            content: content,
        };
        messages.push(message);

        if (!output.callings?.length) return;
        message.content = [];
        if (content) message.content.push({
            type: "text",
            text: content,
        });

        const contents: Anthropic.ContentBlockParam[] = [];
        messages.push({
            role: "user",
            content: contents,
        });
        for (const calling of output.callings) {
            if (calling.result?.hidden) continue;
            message.content.push({
                id: calling.id,
                type: "tool_use",
                input: tryParseJson(calling.arguments),
                name: calling.name,
            });

            const content = await generateContent(
                calling.result?.content ?? "error", toolRole, "output");
            items.push({
                role: `tool: ${calling.name}`,
                content: `${calling.id}\r\narguments: \r\n${calling.arguments}\r\nresponse: \r\n${content}`,
            });
            contents.push({
                type: "tool_result",
                tool_use_id: calling.id,
                content
            })
        }
    }

    async function pushLorebooks(inputs: PresetLorebookModel[]) {
        const lorebooks: PresetLorebookModel[] = [];
        for (const lorebook of inputs) {
            if (visitedLorebooks.has(lorebook.code)) continue;
            visitedLorebooks.add(lorebook.code);
            lorebooks.push(lorebook);
        }
        const groups = sequenceGroupBy(lorebooks, u => u.role);
        for (const group of groups) {
            if (group.key === 'knowledge') {
                simCount += 1;
                await pushOutput({
                    content: "",
                    properties: {},
                    thought: "",
                    variables: [],
                    callings: [
                        {
                            index: 0,
                            id: `call_x${simCount}`,
                            name: virtualTool.name,
                            arguments: "{}",
                            result: {
                                content: joinAsString(group.items, "\r\n", u => u.content),
                                hidden: false
                            }
                        }
                    ]
                }, "knowledge")
            } else if (group.key === 'system') {
                for (const item of group.items) {
                    const text = await generateContent(item.content, group.key, "lorebook");
                    items.push({role: group.key, content: text});
                    systemPrompts.push(text);
                }
            } else {
                const content: Anthropic.TextBlockParam[] = [];
                for (const item of group.items) {
                    const text = await generateContent(item.content, group.key, "lorebook");
                    items.push({role: group.key, content: text});
                    content.push({text, type: "text"});
                }
                messages.push({role: group.key as any, content,});
            }
        }
    }

    async function generateContent(str: string, role: string, type: string) {
        return await slotUtils.handleContent(contentHandlers, {str, role, type});
    }
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