import {matchName} from "../models";
import {MatchEditor} from "./editor";
import {Matcher, matchUtils} from "@/engines/lorebooks/client/match-models";
import {search} from "@orama/orama";

const propertyName = "knowledgeLorebooks";

export const vectorMatcher: Matcher =
    {
        id: matchName,
        component: MatchEditor,
        getValue: () => {
            return {};
        },
        match: async (context, lorebook) => {
            if (!context.cache.rag) return false;
            const {properties} = context;
            let lorebookNames: Set<string> = properties[propertyName];
            if (!lorebookNames) {
                const content = matchUtils.getContent(context);
                const {generator, database} = context.cache.rag;
                const embedding = await generator.generateEmbedding({
                    content,
                });
                const results = await search(database, {
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
                console.debug("[lorebook](results): ", results);
                lorebookNames = new Set(results.hits
                    .map(u => u.document.name));
                properties[propertyName] = lorebookNames;
            }

            return lorebookNames.has(lorebook.code);
        }
    } as const;