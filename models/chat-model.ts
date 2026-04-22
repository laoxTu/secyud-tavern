// models/chat-model.ts
import {PresetRefModel} from "@/models/preset-model";

export interface ChatModel {
    // 存档唯一标识符，UUID
    id: string,
    // 用户自定义的存档名称
    name: string,
    // 当前激活的预设ID列表
    presets: PresetRefModel[],
    // 对话消息记录
    entries: any,
    content: any,
}
