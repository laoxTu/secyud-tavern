import {presetStorage} from "@/modules/presets/server/storage";
import {styleStorageProvider} from "@/engines/styles/server/storage";


export function registerStylesServer() {
    presetStorage.register(styleStorageProvider)
}