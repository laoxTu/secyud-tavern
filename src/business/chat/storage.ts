// src/business/chat/storage.ts
import {ModelStorage} from "@/src/model/storage";
import {ChatModel} from "./index";

const storage = new ModelStorage<ChatModel>("preset",)
export default storage;