// src/models/storage.ts
import {Registerable, Registry} from "@/models/registerable";

export interface ModelStorageProvider<T> extends Registerable {
    loadModel: (model: T) => Promise<void>,
    saveModel: (model: T) => Promise<void>,
}

export class ModelStorage<T> extends Registry<ModelStorageProvider<T>> {
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
}