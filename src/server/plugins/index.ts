// src/server/plugins/index.ts
import {Registerable, Registry} from "@/shared/register";

export class ServerRegistry<T extends Registerable> extends Registry<T> {

}
