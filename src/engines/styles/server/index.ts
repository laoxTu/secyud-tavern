import {presetStorage} from "@/presets/server/storage";
import {styleStorageProvider} from "@/engines/styles/server/storage";


export function registerStylesServer() {
    presetStorage.register(styleStorageProvider)
}