import {useTranslations} from "next-intl";
import React from "react";
import {
    compareLorebook,
    enginePlural as lorebookPlural,
    PresetLorebookModel
} from "@/engines/lorebooks/models";
import {
    getCurrentOutputs,
} from "@/modules/slots/models";
import {getContent, handleContent, LlmapiHistory, LlmapiInputContext} from "@/modules/slots/client/conversation-models";
import {Field, FieldLabel} from "@/components/ui/field";
import {moduleName} from "@/modules/llmapis/models";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";
import {fillToolCallContent, ToolConversationCache} from "@/engines/tools/client/conversation";
import {Selector} from "@/components/custom/selector";
import {OpenAIInputBuilderConfigModel} from "../models";
import {OpenAI} from "openai";
import {joinAsString, sequenceGroupBy} from "@/utils";
import {enginePlural as toolPlural} from "@/engines/tools/models";
import {LlmapiInputItem} from "@/modules/llmapis/client/provider-models";
import {StoryOutputMessage} from "@/modules/stories/models";

const virtualTool: OpenAI.ChatCompletionFunctionTool = {
    type: "function",
    function: {
        name: "getLorebook",
        description: "get lorebook. return empty if current lorebook is requested. ",
    }
}

// 按序拼装历史、世界书、开场白成 messages，相同角色连续消息合并压缩。
export async function generateInput(
    {histories, slot, config, current, contentHandlers}: LlmapiInputContext) {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    const visitedLorebooks = new Set<string>();
    const entries = getContent<LorebookConversationCache>(slot, lorebookPlural);
    const tools: OpenAI.ChatCompletionTool[] = Object
        .values(getContent<ToolConversationCache>(slot, toolPlural).tools)
        .map((u) => ({
            type: "function",
            function: {
                name: u.model.name,
                parameters: u.model.parameters as any,
                description: u.model.description,
            }
        }));
    tools.push(virtualTool);
    const items: LlmapiInputItem[] = [];
    const builder: OpenAIInputBuilderConfigModel = config.inputBuilder;
    let simCount = 0;

    switch (builder.type) {
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

    return {
        input: {
            messages,
            tools: tools.length > 0 ? tools : undefined
        },
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
        const outputs = getCurrentOutputs(history);
        if (outputs) {
            for (const output of outputs) {
                await pushOutput(output);
            }
        }
    }

    async function pushOutput(output: StoryOutputMessage, toolRole = "tool") {
        const aiContent = await generateContent(output.content, "assistant", "output");
        if (aiContent) items.push({content: aiContent, role: "assistant"});
        const message: OpenAI.ChatCompletionAssistantMessageParam = {
            role: "assistant",
            content: aiContent ? aiContent : undefined,
            tool_calls: output.callings ? [] : undefined,
            refusal: null
        };
        messages.push(message);
        if (!output.callings?.length) return;
        // 再次触发工具执行，fillToolCallContent 靠 content 已填去重。
        await fillToolCallContent(output.callings, slot);
        for (const calling of output.callings) {
            message.tool_calls?.push({
                id: calling.id,
                type: "function",
                function: {
                    arguments: calling.arguments,
                    name: calling.name,
                },
            });

            const content = await generateContent(calling.content ?? "error", toolRole, "output");
            items.push({
                role: "tool",
                content: `${calling.id}\r\nname: ${calling.name}\r\narguments: ${calling.arguments}\r\nresponse: ${content}`,
            });
            messages.push({
                role: "tool",
                tool_call_id: calling.id,
                content,
            });
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
                            name: virtualTool.function.name,
                            arguments: "{}",
                            content: joinAsString(group.items, "\r\n", u => u.content),
                        }
                    ]
                }, "knowledge")
            } else {
                const content: OpenAI.ChatCompletionContentPartText[] = [];
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
        return await handleContent(contentHandlers, {str, role, type});
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