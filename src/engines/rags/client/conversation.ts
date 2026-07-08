import {
    engineName,
    enginePlural,
} from "../models";
import {
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer
} from "@/slots/client/conversation-models";
import {getCurrentOutput, StoryHistoryMessage} from "@/stories/models";
import {
    RagConversationCache,
    RagSearchContext,
    RagVectorSchema,
    ragVectorSchema,
    useRagSettingState
} from "@/engines/rags/client/models";
import {create, insert, search} from "@orama/orama";
import {
    PresetLorebookModel, enginePlural as lorebookEnginePlural
} from "@/engines/lorebooks/models";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {matchName} from "@/engines/lorebooks/match/vector/models";

export async function tryFillActiveVectors({lorebookDb, message, generator}: RagSearchContext) {
    if (!generator || !lorebookDb) {
        return null;
    }
    const embedding = await generator.generateEmbedding({
        content: message.content
    });
    const results = await search(lorebookDb, {
        mode: 'vector', // 核心：结合全文和向量搜索
        vector: {
            value: embedding, // 用于向量匹配
            property: 'embedding', // 指定要匹配的向量字段
        },
        // 可选：限制返回数量
        limit: 5,
        // 可选：设定相似度阈值，低于此分数的不返回
        similarity: 0.75
    });
    console.debug("[rag]", results);
    const activeLorebooks: string[] = results.hits.map(u => u.document.name);

    message.properties[enginePlural] = activeLorebooks;
    return activeLorebooks;
}

export const ragConversationProvider:
    SlotInitializer
    & LlmapiInputProcesser
    & LlmapiOutputProcesser
    = {
    id: engineName,
    onInitialize: async (ctx) => {
        const cache: RagConversationCache = {};
        const manager = embeddingGeneratorManager;
        const state = useRagSettingState.getState();
        const provider = manager.records[state.embeddingGenerator];

        if (!provider) return;
        cache.generator = await provider.getGenerator();
        cache.lorebookDb = create<RagVectorSchema>({
            schema: {
                ...ragVectorSchema,
                embedding: `vector[${cache.generator.embeddingDimension}]`
            }
        })

        for (const preset of ctx.slot.presets) {
            const entries = preset.entries
                ?.[lorebookEnginePlural] as PresetLorebookModel[];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled || entry.matchType !== matchName) continue;
                const name = `${preset.code}-${entry.code}`;
                const embedding = await cache.generator.generateEmbedding({
                    content: entry.content,
                });
                await insert(cache.lorebookDb, {
                    name,
                    embedding
                })
            }
        }
        ctx.slot.content[enginePlural] = cache;
    },
    onProcessInput: async (ctx) => {
        const cache: RagConversationCache = ctx.slot.content[enginePlural];
        if (!cache.generator || !cache.lorebookDb) return;

        const lorebookCache: LorebookConversationCache = ctx.slot.content[lorebookEnginePlural];
        const prepareLorebooks: PresetLorebookModel[] = [];
        for (const history of ctx.histories) {
            for (const input of history.inputs) {
                await setActiveVectors(input);
            }

            const lorebooks = history.properties[enginePlural];
            // 设置缓存，缓存的世界书来源可能不一样，如果前面设置过，需要合并。
            history.properties[enginePlural] = [
                ...(lorebooks ?? []),
                ...prepareLorebooks];

            prepareLorebooks.length = 0;

            const output = getCurrentOutput(history);
            if (output) {
                await setActiveVectors(output);
            }
        }

        async function setActiveVectors(message: StoryHistoryMessage) {
            console.debug("setActiveVectors: message", message);
            const lorebookNames = message.properties[enginePlural] ?? await tryFillActiveVectors({
                message, ...cache
            });
            if (!lorebookNames) return;

            for (const lorebookName of lorebookNames) {
                const lorebook = lorebookCache.entries[lorebookName];
                if (lorebook) {
                    prepareLorebooks.push(lorebook);
                }
            }
        }
    },
    onProcessOutput: async (ctx) => {
        const message = getCurrentOutput(ctx.history);
        if (message) {
            const cache: RagConversationCache = ctx.slot.content[enginePlural];
            if (cache.generator && cache.lorebookDb) {
                await tryFillActiveVectors({
                    message, ...cache
                });
            }
        }
    }
};
