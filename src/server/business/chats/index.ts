import {createRepository, entryTable, masterTable, ModelStorage} from "@/server/business";
import {ChatModel} from "@/shared/business/chats";

// 存档主表
export const chats = masterTable("chats");

// 存档从表
export const chatEntries = entryTable(
    "chat_entries", () => chats.id, {onDelete: "cascade"});

export const chatStorage = new ModelStorage<ChatModel>("chats",)

export const chatRepository =
    createRepository<ChatModel, typeof chats.$inferSelect>(
        chats, chatEntries,
        chatStorage.loadModel.bind(chatStorage),
        chatStorage.saveModel.bind(chatStorage),
        chatStorage.bindSearch.bind(chatStorage),
    )

