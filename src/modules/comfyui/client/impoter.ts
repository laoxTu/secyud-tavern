import {ClientRegistry} from "@/plugins/client";
import {ComfyUIModelImporter} from "./impoter-models";

export const comfyUIModelImporterRegistry = new ClientRegistry<ComfyUIModelImporter>("comfyuiModelImporter");