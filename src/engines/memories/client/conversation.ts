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
import {PresetModel} from "@/modules/presets/models";
import {StoryModel} from "@/modules/stories/models";

async function createInjectHandler(
    {
        slot,
        histories,
    }: LlmapiInputContext, {
        toolName,
        pushToolMessage,
    }: InjectContext): Promise<InjectHandler> {
    const visited = new Set<string>();
    const cache = slotUtils
        .getProperty<MemoryConversationCache>(slot, enginePlural);
    let simulation = 0;
    return {
        after: async (i) => {
            if (i === histories.length - 1) return;
            const memories: StoryMemoryModel[] = [];
            const history = histories[i];
            const outputs = historyUtils.getOutputs(history);
            if (!outputs) return;
            for (const output of outputs) {
                const codesList = getMemoryCodes(output, false);
                if (!codesList?.length) continue;
                for (const codes of codesList) {
                    for (const code of codes) {
                        if (visited.has(code)) continue;
                        visited.add(code);
                        const memory = cache.memories[code];
                        if (!memory) continue;
                        memories.push(memory);
                    }
                }
            }
            if (!memories.length) return;
            const content = Object.fromEntries(
                memories.map(m => ([m.code, m.text])));
            console.debug(`[memory](inject): `, content);
            pushToolMessage([
                {
                    index: 0,
                    id: `${toolName(simulation)}m`,
                    name: getKnowledgeTool.name,
                    arguments: "{}",
                    result: {
                        content: `memory: ${JSON.stringify(content)}`,
                        hidden: false
                    }
                }
            ]);
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
            await businessUtils.useEntries<StoryMemoryModel, StoryModel>(ctx.slot, enginePlural,
                async entry => {
                    cache.memories[entry.code] = entry;
                    const embedding = await generator.generateEmbedding({
                        content: entry.text,
                    });
                    await insert(database, {
                        name: `${entry.id}`,
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
