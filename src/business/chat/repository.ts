// src/business/chat/repository.ts
import {chatEntries, chatRequires, chats} from "./db";
import {createRepository} from "@/database/repository-base";
import storage from "./storage"
import {ChatModel} from "@/business/chat/models";


export const repository =
    createRepository<ChatModel, typeof chats.$inferSelect>(
        chats, chatEntries, chatRequires, storage.loadModel.bind(storage), storage.saveModel.bind(storage))

