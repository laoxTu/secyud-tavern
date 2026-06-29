import {Registerable, Registry} from "@/utils/register";

export class ClientRegistry<T extends Registerable> extends Registry<T> {
    constructor(name: string, ...registrableItems: T[]) {
        super(name);

        for (const item of registrableItems) {
            this.register(item);
        }
    }
}
