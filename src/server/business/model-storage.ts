import {Registerable} from "@/shared/register";
import {ServerRegistry} from "@/server/plugins";

export interface ModelStorageProvider<T> extends Registerable {
    // 加载，导出时使用
    loadModel: (model: T) => Promise<void>,
    // 仅导入，复制时会使用
    saveModel: (model: T) => Promise<void>,
    // 存储 entry时提取 search 字段
    bindSearch: (entry: any) => string
}

export class ModelStorage<T> extends ServerRegistry<ModelStorageProvider<T>> {
    constructor(name: string) {
        super(`${name} storage`);
    }

    async loadModel(model: T): Promise<void> {
        await this.use(async provider => {
            await provider.loadModel(model);
        })
    }

    async saveModel(model: T): Promise<void> {
        await this.use(async provider => {
            await provider.saveModel(model);
        })
    }

    bindSearch(type: string, entry: any) {
        const provider = this.records[type];
        return provider.bindSearch(entry);
    }
}