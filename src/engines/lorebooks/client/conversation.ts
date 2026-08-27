import {compareLorebook, engineName, enginePlural, PresetLorebookModel,} from "../models";
import {matchName as alwaysMatch} from "../match/always/models";
import {tryFillActiveLorebooks} from "@/engines/lorebooks/client/match";
import {
    InjectContext,
    InjectHandler,
    LlmapiInputContext,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer,
    slotUtils
} from "@/modules/stories/client/conversation-models";
import {engineName as toolEngineName} from '@/engines/tools/models';
import {historyUtils, SlotHistory} from "@/modules/models";
import {SlotMessageBase} from "@/modules/models/message";
import {joinAsString, sequenceGroupBy, tryParseJson} from "@/utils";
import {getKnowledgeTool} from "@/modules/llmapis/client/input-builder";
import {LorebookConversationCache, lorebookSchema} from "@/engines/lorebooks/client/models";
import {createDatabase} from "@/engines/rags/client/models";
import {matchName as vectorMatch} from "@/engines/lorebooks/match/vector/models";
import {insert} from "@orama/orama";
import {businessUtils} from "@/business/models";
import {PresetModel} from "@/modules/presets/models";

async function createInjectHandler(
    {
        slot,
        histories,
        contentHandlers,
    }: LlmapiInputContext, {
        builder,
        toolName,
        pushToolMessage,
        pushUserMessage,
        pushAiMessage,
        pushSystemMessage,
    }: InjectContext): Promise<InjectHandler> {
    const cache: LorebookConversationCache =
        slotUtils.getProperty(slot, enginePlural);
    const visited = new Set<string>();
    let lorebooks: PresetLorebookModel[] = [];
    let simulation = 0;
    switch (builder) {
        case "layered": {
            await insertLorebooks(cache.before);
            await insertLorebooks(cache.after);
            for (const history of histories) {
                await insertMessages(history, history.inputs, false);
                if (history === histories.at(-1)) break;
                await insertMessages(history, historyUtils.getOutputs(history), true);
            }
            lorebooks.sort(compareLorebook);
            let index = 0;
            return {
                async middle(i: number) {
                    const items: PresetLorebookModel[] = [];
                    for (; index < lorebooks.length; index++) {
                        const u = lorebooks[index];
                        if (i === histories.length - 1 ||
                            u.layer + histories.length >= i + 100) break;
                        items.push(u);
                    }
                    await generateLorebooks(items);
                },
            };
        }
        default:
            let index = 0;
            await insertLorebooks(cache.before);
            return {
                async before(i: number) {
                    const history = histories[i];
                    await insertMessages(history, history.inputs, false);
                    if (i === histories.length - 1)
                        await insertLorebooks(cache.after);
                    lorebooks.sort(compareLorebook);
                    const c = lorebooks.findIndex(u => u.layer >= 100);
                    index = c < 0 ? lorebooks.length : c;
                    // 添加user前世界书
                    await generateLorebooks(lorebooks.slice(0, index))
                },
                async middle() {
                    // 添加user后世界书
                    await generateLorebooks(lorebooks.slice(index, lorebooks.length));
                    lorebooks.length = 0;
                },
                async after(i: number) {
                    if (i === histories.length - 1) return;
                    const history = histories[i];
                    await insertMessages(history, historyUtils.getOutputs(history), true);
                },
            };
    }

    async function generateContent(str: string, role: string, type: string) {
        return await slotUtils.handleContent(contentHandlers, {str, role, type});
    }

    async function generateLorebooks(lorebooks: PresetLorebookModel[]) {
        const groups = sequenceGroupBy(lorebooks, u => u.role);
        console.debug("[lorebook]: ", lorebooks);
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
                            id: `${toolName(simulation)}l`,
                            name: getKnowledgeTool.info.name,
                            arguments: getKnowledgeTool.args({
                                type: "lorebook",
                            }),
                            result: {content}
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

    async function insertMessages(
        history: SlotHistory,
        messages: SlotMessageBase[] | null,
        output: boolean) {
        if (!messages?.length) return;
        for (const message of messages) {
            const codes = message.properties[enginePlural] ??
                await tryFillActiveLorebooks(cache.entries, {
                    history, message,
                    properties: {},
                    output,
                    cache,
                });
            for (const code of codes) {
                if (visited.has(code)) continue;
                visited.add(code);
                const lorebook = cache.entries[code];
                if (lorebook) {
                    lorebooks.push(cache.entries[code]);
                }
            }
        }
    }

    async function insertLorebooks(inputs: PresetLorebookModel[]) {
        for (const lorebook of inputs) {
            if (visited.has(lorebook.code)) {
                continue;
            }
            visited.add(lorebook.code);
            lorebooks.push(lorebook);
        }
    }
}


export const lorebookConversationProvider:
    SlotInitializer
    & LlmapiInputProcesser
    & LlmapiOutputProcesser
    = {
    id: engineName,
    requires: [toolEngineName],
    onInitialize: async ({slot}) => {
        const cache: LorebookConversationCache = {
            before: [],
            after: [],
            entries: {},
            rag: await createDatabase(lorebookSchema),
        };
        await businessUtils.useEntriesList<PresetLorebookModel, PresetModel>(slot.presets, enginePlural,
            async (entry, model) => {
                if (entry.disabled) return;
                if (entry.type === "json") {
                    entry.content = JSON.stringify(tryParseJson(entry.content));
                }
                const id = `${model.code}-${entry.code}`;
                // 替换code，唯一标识
                entry.code = id;
                if (entry.matchType === alwaysMatch) {
                    if (entry.matchExpression?.lastMessage)
                        cache.after.push(entry);
                    else cache.before.push(entry);
                } else {
                    cache.entries[id] = entry;
                }

                if (cache.rag &&
                    entry.matchType === vectorMatch) {
                    const {generator, database} = cache.rag;
                    const embedding = await generator
                        .generateEmbedding({
                            content: entry.content,
                        });
                    await insert(database, {
                        name: id,
                        embedding,
                    });
                }
            });
        console.debug(`[lorebook](cache): `, cache);

        slotUtils.setProperty(slot, enginePlural, cache);
    },
    onProcessInput: async (ctx) => {
        ctx.injectorCreators
            .push((injectCtx) =>
                createInjectHandler(ctx, injectCtx));
    },
    onProcessOutput: async (ctx) => {
        const outputs = historyUtils.getOutputs(ctx.history);
        if (!outputs) return;
        const cache: LorebookConversationCache = slotUtils.getProperty(ctx.slot, enginePlural);
        for (const output of outputs) {
            await tryFillActiveLorebooks(cache.entries, {
                history: ctx.history, message: output,
                properties: {},
                output: true,
                cache,
            });
        }
    }
};
