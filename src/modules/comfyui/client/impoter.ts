import {ClientRegistry} from "@/plugins/client";
import {ComfyUIModelImporter} from "./impoter-models";

export class ComfyUIModelImporterRegistry extends ClientRegistry<ComfyUIModelImporter> {
}

export const comfyUIModelImporterRegistry = new ComfyUIModelImporterRegistry("comfyuiModelImporter");