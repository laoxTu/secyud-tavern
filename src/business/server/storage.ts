import {ServerRegistry} from "@/plugins/server";
import {ModelStorageProvider} from "./storage-models";


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
        return provider?.bindSearch(entry) ?? `${entry?.name}${entry.code}`;
    }
}