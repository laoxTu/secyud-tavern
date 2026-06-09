// src/server/plugins/index.ts
import {Registerable, Registry} from "@/utils/register";

export class ServerRegistry<T extends Registerable> extends Registry<T> {

}
