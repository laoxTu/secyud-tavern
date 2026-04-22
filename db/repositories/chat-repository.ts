// db/repositories/chat-repository.ts
import {chatEntries, chatRequires, chats} from "../schema/chats";
import {ChatModel} from "@/models/chat-model";
import {chatManager} from "@/services/chat/chat-manager";
import {createRepository} from "@/db/repositories/repository-base";


export const chatRepository =
    createRepository<ChatModel, typeof chats.$inferSelect>(
        chats, chatEntries, chatRequires, chatManager.loadModel, chatManager.saveModel)

