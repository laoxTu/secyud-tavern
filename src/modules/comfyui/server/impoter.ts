import {ComfyUIModelImporter} from "./impoter-models";
import {getInstance, ServerRegistry} from "@/plugins/server";

class ComfyUIModelImporterRegistry extends ServerRegistry<ComfyUIModelImporter> {
    constructor(name: string) {
        super(name);
    }
}

export const comfyUIModelImporterRegistry = getInstance<ComfyUIModelImporterRegistry>(
    "comfyUIModelImporter", u => new ComfyUIModelImporterRegistry(u)
);