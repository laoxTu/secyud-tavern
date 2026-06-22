import {Registerable} from "@/utils/register";
import {BaseModel, EntryModel} from "@/business/models";
import {Repository} from "@/business/server/repository";


export interface ModelStorageProvider<T> extends Registerable {
    // 加载，导出时使用
    loadModel: (model: T) => Promise<void>,
    // 仅导入，复制时会使用
    saveModel: (model: T) => Promise<void>,
    // 存储 entry时提取 search 字段
    bindSearch: (entry: any) => string
}

export function createSimpleStorageProvider<T extends BaseModel>(id: string, arrayName: string, repository: Repository<T>): ModelStorageProvider<T> {
    return {
        id: id,
        loadModel: async (model: T) => {
            if (!model.entries)
                throw new Error("model.entries should be query this time");
            const entries =
                await repository.entry.getList(model.id, id);
            model.entries[arrayName] = entries.data;
        },
        saveModel: async (model: T) => {
            if (!model.entries)
                throw new Error("model.entries should be query this time");
            if (Array.isArray(model.entries[arrayName]) &&
                model.entries[arrayName].length > 0) {
                await repository.entry.batchCreate(
                    model.id, id, model.entries[arrayName]);
            }
        },
        bindSearch: (entry: EntryModel) => {
            return entry.name + entry.code;
        }
    }
}