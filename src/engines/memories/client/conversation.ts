import {engineName, enginePlural, StoryMemoryModel,} from "../models";
import {
    InjectContext,
    InjectHandler,
    LlmapiInputContext,
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer,
    slotUtils
} from "@/modules/stories/client/conversation-models";
import {engineName as toolEngineName} from "@/engines/tools/models";
import {getMemoryCodes, MemoryConversationCache, memorySchema} from "@/engines/memories/client/models";
import {insert} from "@orama/orama";
import {createDatabase} from "@/engines/rags/client/models";
import {historyUtils} from "@/modules/models";
import {getKnowledgeTool} from "@/modules/llmapis/client/input-builder";
import {businessUtils} from "@/business/models";
import {StoryModel} from "@/modules/stories/models";
import {SlotCalling} from "@/modules/models/calling";
import {joinAsString} from "@/utils";

async function createInjectHandler(
    {
        slot,
        histories,
    }: LlmapiInputContext, {
        toolName,
        pushToolMessage,
    }: InjectContext): Promise<InjectHandler> {
    const visited = new Set<number>();
    const cache = slotUtils
        .getProperty<MemoryConversationCache>(slot, enginePlural);
    let simulation = 0;
    return {
        after: async (i) => {
            if (i === histories.length - 1) return;
            // 需要注入内容
            const newMemories: StoryMemoryModel[] = [];
            // 只注入Key
            const keyMemories: StoryMemoryModel[] = [];
            const visitedKeys = new Set<number>();
            const history = histories[i];
            const outputs = historyUtils.getOutputs(history);
            if (!outputs) return;
            for (const output of outputs) {
                const idsList = getMemoryCodes(output, false);
                if (!idsList?.length) continue;
                for (const ids of idsList) {
                    for (const id of ids) {
                        if (visitedKeys.has(id)) continue;
                        visitedKeys.add(id);
                        const memory = cache.memories[id];
                        if (!memory) continue;
                        keyMemories.push(memory);
                        if (visited.has(id)) continue;
                        visited.add(id);
                        newMemories.push(memory);
                    }
                }
            }
            if (!keyMemories.length) return;
            const callings: SlotCalling[] = [{
                index: 0,
                id: `${toolName(simulation++)}m`,
                name: getKnowledgeTool.info.name,
                arguments: getKnowledgeTool.args({
                    type: "memory"
                }),
                result: {
                    content: joinAsString(keyMemories, "\n",
                        u => u.name),
                }
            }];
            if (newMemories.length) {
                callings.push({
                    index: 1,
                    id: `${toolName(simulation++)}m`,
                    name: getKnowledgeTool.info.name,
                    arguments: getKnowledgeTool.args({
                        type: "memory_dict"
                    }),
                    result: {
                        content: joinAsString(newMemories, "\n",
                            u => `- ${u.name}: ${u.text}`),
                    }
                })
            }
            pushToolMessage(callings);
        }
    }
}

export const memoriesConversationProvider: SlotInitializer
    & LlmapiInputProcesser
    & LlmapiOutputProcesser
    = {
    id: engineName,
    requires: [toolEngineName],
    onInitialize: async (ctx) => {
        const cache: MemoryConversationCache = {
            rag: await createDatabase(memorySchema),
            memories: {},
        };
        if (cache.rag) {
            const {generator, database} = cache.rag;
            await businessUtils.useEntries<StoryMemoryModel, StoryModel>(
                ctx.slot, enginePlural, _ => "s",
                async entry => {
                    cache.memories[entry.entryId] = entry;
                    const embedding = await generator
                        .generateEmbedding({content: entry.text,});
                    await insert(database, {
                        entryId: entry.entryId,
                        code: entry.code,
                        tags: entry.tags,
                        type: entry.type,
                        importance: entry.importance,
                        sequence: entry.sequence,
                        embedding,
                    })
                })
        }
        slotUtils.setProperty(ctx.slot, enginePlural, cache);
    },
    onProcessInput: async (ctx) => {
        ctx.injectorCreators.push((injectCtx) => createInjectHandler(ctx, injectCtx));
    },
    onProcessOutput: async () => {

    }
};
