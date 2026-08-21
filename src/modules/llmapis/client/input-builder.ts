import {LlmapiHistory, LlmapiInputContext, slotUtils} from "@/modules/slots/client/conversation-models";
import {SlotCalling} from "@/modules/models/calling";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";
import {compareLorebook, enginePlural as lorebookPlural, PresetLorebookModel} from "@/engines/lorebooks/models";
import {historyUtils} from "@/modules/models";
import {fillToolCallContent} from "@/engines/tools/client/conversation";
import {joinAsString, sequenceGroupBy} from "@/utils";
import {SlotMessageOutput} from "@/modules/models/message";

export const getLorebookTool =
    {
        name: "getLorebook",
        description: "get lorebook. return empty if current lorebook is requested. ",
    }

export async function generateMessageWithBuilder(
    {
        slot,
        histories,
        contentHandlers,
        current,
    }: LlmapiInputContext,
    {
        builder,
        toolName,
        pushUserMessage,
        pushAiMessage,
        pushToolMessage,
        pushSystemMessage,
    }: {
        toolName: (index: number) => string,
        builder: string,
        pushUserMessage: (content: string) => void,
        pushAiMessage: (content: string, output?: SlotMessageOutput) => void,
        pushToolMessage: (callings: SlotCalling[], content?: string,
                          output?: SlotMessageOutput) => void,
        pushSystemMessage: (content: string) => void,
    }) {
    const entries = slotUtils
        .getContent<LorebookConversationCache>(slot, lorebookPlural);
    const visited = new Set<string>();
    let simulation = 0;
    switch (builder) {
        case "layered":
            let lorebooks: PresetLorebookModel[] = [...entries.before, ...entries.after];
            fillLorebooks(lorebooks, histories.map(u => u.content[lorebookPlural]))

            for (let i = 0; i < histories.length; i++) {
                const history = histories[i];
                await generateInput(history);
                const index = lorebooks.findIndex(
                    u => u.layer + histories.length >= i + 100);
                const splitIndex = index < 0 ? lorebooks.length : index;
                const items = lorebooks.slice(0, splitIndex);
                lorebooks = lorebooks.slice(splitIndex);
                await generateLorebooks(items);
                if (i < histories.length - 1 || current)
                    await generateOutputs(history);
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
                await generateLorebooks(lorebooks.slice(0, splitIndex))

                await generateInput(history);

                // 添加user后世界书
                await generateLorebooks(lorebooks.slice(splitIndex, lorebooks.length))

                if (i < histories.length - 1 || current)
                    await generateOutputs(history);
            }
            break;
    }

    function fillLorebooks(lorebooks: PresetLorebookModel[], groups: PresetLorebookModel[][]) {
        for (const group of groups) {
            for (const item of group) {
                lorebooks.push(item);
            }
        }
        lorebooks.sort(compareLorebook);
    }

    async function generateOutputs(history: LlmapiHistory) {
        const outputs = historyUtils.getOutputs(history);
        if (!outputs) return;
        for (const output of outputs) {
            const content = await generateContent(output.content, "assistant", "output");
            // 检验工具是否触发
            await fillToolCallContent(slot, output.callings);
            const callings = output.callings
                ?.filter(u => !u.result?.hidden);
            if (callings?.length) {
                pushToolMessage(callings, content, output);
            } else if (content) {
                pushAiMessage(content, output);
            }
        }
    }

    async function generateLorebooks(inputs: PresetLorebookModel[]) {
        const lorebooks: PresetLorebookModel[] = [];
        for (const lorebook of inputs) {
            if (visited.has(lorebook.code)) continue;
            visited.add(lorebook.code);
            lorebooks.push(lorebook);
        }
        const groups = sequenceGroupBy(lorebooks, u => u.role);
        for (const group of groups) {
            const contents: string[] = [];
            for (const item of group.items) {
                contents.push(await generateContent(
                    item.content, group.key, "output"));
            }
            const content = joinAsString(contents, "\n\n");
            switch (group.key) {
                case "knowledge":
                    simulation += 1;
                    pushToolMessage([
                        {
                            index: 0,
                            id: toolName(simulation),
                            name: getLorebookTool.name,
                            arguments: "{}",
                            result: {content, hidden: false}
                        }
                    ]);
                    break;
                case "system":
                    pushSystemMessage(content);
                    break;
                case "assistant":
                    pushAiMessage(content);
                    break;
                case "user":
                    pushUserMessage(content);
                    break;
                default:
                    break;
            }
        }
    }

    async function generateInput(history: LlmapiHistory) {
        if (history.inputs.length) {
            const input = joinAsString(history.inputs, "\r\n", u => u.content);
            const content = await generateContent(input, "user", "input");
            pushUserMessage(content)
        }
    }

    async function generateContent(str: string, role: string, type: string) {
        return await slotUtils.handleContent(contentHandlers, {str, role, type});
    }
}