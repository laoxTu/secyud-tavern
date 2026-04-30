// src/business/chat/repository.ts
import {chatEntries, chats} from "./db";
import {createRepository} from "@/database/repository-base";
import {chatStorage} from "."
import {ChatModel} from "@/business/chat/models";


export const repository =
    createRepository<ChatModel, typeof chats.$inferSelect>(
        chats, chatEntries,
        chatStorage.loadModel.bind(chatStorage),
        chatStorage.saveModel.bind(chatStorage),
        chatStorage.bindSearch.bind(chatStorage),
    )

