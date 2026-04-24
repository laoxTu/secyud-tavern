// src/business/chat/storage.ts
import {ModelStorage} from "@/src/models/storage";
import {ChatModel} from "./models";

const storage = new ModelStorage<ChatModel>("preset",)
export default storage;