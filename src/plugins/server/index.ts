// src/server/plugins/index.ts
import {Registerable, Registry} from "@/utils/register";

export class ServerRegistry<T extends Registerable> extends Registry<T> {
    protected constructor(name: string) {
        super(name);
    }

}

export function getInstance<T extends ServerRegistry<any>>(
    name: string,
    factory: (name: string) => T,
): T {
    const g = globalThis as { __registries?: Map<string, T> };
    g.__registries ??= new Map();

    if (!g.__registries.has(name)) {
        g.__registries.set(name, factory(name));
    }

    return g.__registries.get(name)!;
}