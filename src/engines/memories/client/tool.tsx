'use client';
import React from "react";
import {LlmapiTool, LlmapiToolProps, LlmapiToolProvider} from "@/engines/tools/client/models";
import {LlmapiToolModel, SlotModel} from "@/modules/stories/models";
import {engineName, enginePlural, MemoryToolConfigModel, StoryMemoryModel} from "@/engines/memories/models";
import {slotUtils} from "@/modules/stories/client/conversation-models";
import {getMemoryCodes, MemoryConversationCache} from "@/engines/memories/client/models";
import {insert, search} from "@orama/orama";
import {v4 as uuidv4} from "uuid";
import {post} from "@/client";
import {historyUtils} from "@/modules/models";
import {slotContext} from "@/modules/stories/client/context";

const memoryTypes = ["event", "relation", "knowledge", "other"];

export function ToolEditor({}: LlmapiToolProps) {
    // const t = useTranslations();
    // const config: MemoryToolConfigModel = mergeObjects({
    // }, entry.value);
    return (
        <>
        </>
    );
}


export const memoryToolProvider: LlmapiToolProvider = {
    id: "memory",
    component: ToolEditor,
    getValue: (): MemoryToolConfigModel => {
        return {
            // description: data.get("description") as string,
        };
    },
    async create(_, slot) {
        return [new MemoryGetTool(slot), new MemorySetTool(slot)];
    },
};

export class MemoryGetTool implements LlmapiTool {
    model: LlmapiToolModel;

    constructor(private slot: SlotModel) {
        this.model = {
            name: "get_memory",
            description: "get the memory keys. memory value is injected by knowledge.",
            parameters: {
                "type": "object",
                "required": ["content"],
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "the question or tag to search",
                    },
                    "types": {
                        "type": "array",
                        "description": "the memory type to search. all if empty.",
                        "items": {
                            "type": "string",
                            "enum": memoryTypes
                        },
                    },
                    "tags": {
                        "type": "array",
                        "description": "the tags to filter. (max 3)",
                        "items": {
                            "type": "string"
                        },
                    },
                    "limit": {
                        "type": "integer",
                        "description": "the memory item count to recall",
                        "minimum": 1,
                        "maximum": 5,
                        "default": 3
                    },
                    "min_relevance": {
                        "type": "number",
                        "description": "the min relevance to filter.",
                        "minimum": 0,
                        "maximum": 1,
                        "default": 0.3
                    }
                },
                "additionalProperties": false
            }
        };
    }

    async invoke(
        {content, types = [], tags = [], limit = 3, min_relevance = 0.3}:
        {
            content: string,
            types?: string[],
            tags?: string[],
            limit?: number,
            min_relevance?: number,
        }) {

        const outputs = historyUtils.getOutputs(
            await slotContext.getHistory(undefined, this.slot));
        const output = outputs?.at(-1);

        if (!output) {
            return {
                hidden: false,
                content: "error: output not found",
            };
        }

        const cache = slotUtils.getProperty<MemoryConversationCache>(this.slot, enginePlural);
        if (!cache.rag) {
            return {
                hidden: false,
                content: "warn: RAG is not enabled"
            };
        }
        const {generator, database} = cache.rag;

        // 生成查询向量
        const embedding = await generator.generateEmbedding({
            content: content,
        });

        // 构建搜索过滤器
        const filter: any[][] = [];
        if (types?.length) {
            filter.push(["type", types]);
        }
        if (tags && tags.length > 0) {
            filter.push(["tags", tags]);
        }

        // 执行向量搜索
        const results = await search(database, {
            mode: "vector",
            vector: {
                value: embedding, // 用于向量匹配
                property: 'embedding', // 指定要匹配的向量字段
            },
            similarity: min_relevance,
            limit: limit * 3,
            where: filter.length ? Object.fromEntries(filter) : undefined,
        });

        const memoryCodes = getMemoryCodes(output);
        const codes = results.hits
            .map(hit => {
                const score = hit.score + hit.document.importance / 10
                    + hit.document.sequence / (this.slot.histories.length + 1);
                return {
                    name: hit.document.name, score
                }
            })
            .sort((a, b) =>
                b.score - a.score)
            .slice(0, limit)
            .map(u => u.name);
        memoryCodes.push(codes);

        return {
            hidden: false,
            content: `memory keys: ${JSON.stringify(codes)}`
        };
    }
}

export class MemorySetTool implements LlmapiTool {
    model: LlmapiToolModel;

    constructor(private slot: SlotModel) {
        this.model = {
            name: "set_memory",
            description: "vectorize content and save.",
            parameters: {
                "type": "object",
                "required": ["content"],
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "the content to vectorize",
                    },
                    "title": {
                        "type": "string",
                        "description": "the memory title. (< 12 words)",
                    },
                    "importance": {
                        "type": "integer",
                        "description": "the importance",
                        "minimum": 1,
                        "maximum": 10,
                        "default": 5
                    },
                    "type": {
                        "type": "string",
                        "description": "the memory type",
                        "enum": memoryTypes,
                    },
                    "tags": {
                        "type": "array",
                        "description": "tags to help search",
                        "items": {
                            "type": "string"
                        },
                    },
                },
                "additionalProperties": false
            },
        };
    }

    async invoke(
        {
            content,
            title,
            type = "event",
            tags = [],
            importance = 5
        }:
        {
            content: string,
            title: string,
            type?: string,
            importance?: number,
            tags?: string[],
        }) {
        const cache = slotUtils.getProperty<MemoryConversationCache>(this.slot, enginePlural);
        if (!cache.rag) return {hidden: false, content: "warn: RAG is not enabled"};
        const {generator, database} = cache.rag;
        const embedding = await generator.generateEmbedding({
            content: content,
        });
        const entry: StoryMemoryModel = {
            disabled: false,
            id: 0,
            code: uuidv4(),
            name: title,
            importance,
            sequence: this.slot.histories.length,
            text: content,
            tags,
            type,
        };

        const {id} = await post("/stories/{id}/entries/{entryType}",
            entry, {
                params: {
                    id: this.slot.id,
                    entryType: engineName,
                }
            });
        entry.id = id;
        cache.memories[id] = entry;
        await insert(database, {
            name: entry.code,
            tags: entry.tags,
            type: entry.type,
            importance: entry.importance,
            sequence: entry.sequence,
            embedding,
        });
        return {
            content: "success",
            hidden: true,
        };
    }
}

