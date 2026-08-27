import {RagModel} from "@/engines/rags/client/models";
import {StoryMemoryModel} from "@/engines/memories/models";
import {SlotMessageOutput} from "@/modules/models/message";

export const memorySchema = {
    entryId: 'number',
    code: 'string',
    tags: 'string[]',
    type: 'string',
    importance: "number",
    sequence: "number",
} as const;

export interface MemoryConversationCache {
    rag: RagModel<typeof memorySchema> | null,
    memories: Record<string, StoryMemoryModel>,
}

export function getMemoryCodes(message: SlotMessageOutput, create: boolean = true) {
    const propertyName = "memoryCodes";
    let memoryCodes: number[][] = message.properties[propertyName];
    if (!memoryCodes && create) {
        memoryCodes = [];
        message.properties[propertyName] = memoryCodes;
    }
    return memoryCodes;
}