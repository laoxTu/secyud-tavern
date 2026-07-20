import {Registerable, Registry} from "@/utils/register";

export class ClientRegistry<T extends Registerable> extends Registry<T> {
    constructor(name: string) {
        super(name);
    }
}
