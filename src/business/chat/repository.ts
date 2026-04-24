// src/business/chat/repository.ts
import {chatEntries, chatRequires, chats} from "./db";
import {createRepository} from "@/src/db/repository-base";
import storage from "./storage"
import {ChatModel} from "@/src/business/chat/models";


export const repository =
    createRepository<ChatModel, typeof chats.$inferSelect>(
        chats, chatEntries, chatRequires, storage.loadModel, storage.saveModel)

