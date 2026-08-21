import {engineName, enginePlural,} from "../models";
import {
    LlmapiInputProcesser,
    LlmapiOutputProcesser,
    SlotInitializer,
    slotUtils
} from "@/modules/slots/client/conversation-models";
import {
    RagConversationCache,
    RagSearchContext,
    RagVectorSchema,
    ragVectorSchema,
    useRagSettingState
} from "@/engines/rags/client/models";
import {create, insert, search} from "@orama/orama";
import {enginePlural as lorebookEnginePlural, PresetLorebookModel} from "@/engines/lorebooks/models";
import {LorebookConversationCache} from "@/engines/lorebooks/client/conversation";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import {matchName} from "@/engines/lorebooks/match/vector/models";
import {historyUtils} from "@/modules/models";
import {SlotMessageBase} from "@/modules/models/message";

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
    console.debug("[rag](results): ", results);
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
        const manager = embeddingGeneratorManager;
        const state = useRagSettingState.getState();

        const provider =
            manager.records[state.embeddingGenerator];
        if (state.disabled || !provider) {
            slotUtils.setProperty(ctx.slot, enginePlural, {
                disabled: true
            });
            return;
        }
        const generator = await provider.getGenerator();
        const cache: RagConversationCache = {
            generator,
            lorebookDb: create<RagVectorSchema>({
                schema: {
                    ...ragVectorSchema,
                    embedding: `vector[${generator.embeddingDimension}]`
                }
            }),
            disabled: false,
        };

        for (const preset of ctx.slot.presets) {
            const entries = preset.entries
                ?.[lorebookEnginePlural] as PresetLorebookModel[];
            if (!entries) continue;
            for (const entry of entries) {
                if (entry.disabled || entry.matchType !== matchName) continue;
                const name = `${preset.code}-${entry.code}`;
                const embedding = await generator.generateEmbedding({
                    content: entry.content,
                });
                await insert(cache.lorebookDb, {
                    name,
                    embedding
                })
            }
        }
        slotUtils.setProperty(ctx.slot, enginePlural, cache);
    },
    onProcessInput: async (ctx) => {
        // 缓存可选：RAG 未启用时 onInitialize 不会写入，这里用守卫而非 getContent；
        // cache.disabled 用于收窄联合类型到完整缓存分支
        const cache: RagConversationCache =
            slotUtils.getProperty(ctx.slot, enginePlural);
        if (cache.disabled) return;

        // 世界书缓存必定初始化，跨引擎读取走 getContent
        const lorebookCache = slotUtils
            .getProperty<LorebookConversationCache>(ctx.slot, lorebookEnginePlural);
        const prepareLorebooks: PresetLorebookModel[] = [];
        for (const history of ctx.histories) {
            for (const input of history.inputs) {
                await setActiveVectors(input);
            }

            const lorebooks = history.content[enginePlural];
            // 设置缓存，缓存的世界书来源可能不一样，如果前面设置过，需要合并。
            history.content[enginePlural] = [
                ...(lorebooks ?? []),
                ...prepareLorebooks];

            prepareLorebooks.length = 0;

            const output = historyUtils
                .getOutputs(history)?.at(-1);
            if (output) await setActiveVectors(output);
        }

        async function setActiveVectors(message: SlotMessageBase) {
            if (cache.disabled) return;
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
        // 同 onProcessInput，RAG 缓存可选，用守卫
        const cache: RagConversationCache = slotUtils.getProperty(ctx.slot, enginePlural);
        if (cache.disabled) return;
        const outputs = historyUtils.getOutputs(ctx.history);
        if (!outputs?.length) return;
        for (const output of outputs) {
            await tryFillActiveVectors({
                message: output, ...cache
            });
        }
    }
};
