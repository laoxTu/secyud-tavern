import {ClientRegistry} from "@/plugins/client";
import {ComfyUIModelImporter} from "./impoter-models";
import {civitaiModelImporter} from "@/modules/comfyui/importers/client/civital-importer";

export class ComfyUIModelImporterRegistry extends ClientRegistry<ComfyUIModelImporter> {
}

export const comfyUIModelImporterRegistry = new ComfyUIModelImporterRegistry("comfyuiModelImporter",
    civitaiModelImporter);