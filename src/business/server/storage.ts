import {getInstance, ServerRegistry} from "@/plugins/server";
import {ModelStorageProvider} from "./storage-models";

export interface IModelStorage<TModel> {
    loadModel(model: TModel): Promise<void>;

    saveModel(model: TModel): Promise<void>;

    bindSearch(type: string, entry: any): string;

    bindSorter(type: string, entry: any): string;
}

export class ModelStorage<T> extends ServerRegistry<ModelStorageProvider<T>> implements IModelStorage<T> {

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

    // 搜索字段，对搜索字段拼接，可以模糊搜索
    bindSearch(type: string, entry: any) {
        const provider = this.records[type];
        return provider?.bindSearch(entry) ?? `${entry?.name}${entry.code}`;
    }

    // 搜索字段，对排序字段拼接，可以实现排序
    bindSorter(type: string, entry: any) {
        const provider = this.records[type];
        return provider?.bindSorter(entry) ?? `${entry?.name}${entry.code}`;
    }

    static getInstance<T>(name: string) {
        return getInstance(name + "Storage", u => new ModelStorage<T>(u));
    }
}