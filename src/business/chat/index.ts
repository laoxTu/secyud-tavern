// src/business/chat/index.ts


import {ModelStorage} from "@/models/storage";
import {ChatModel} from "@/business/chat/models";

const chatStorage = new ModelStorage<ChatModel>("chat",)


export {chatStorage};