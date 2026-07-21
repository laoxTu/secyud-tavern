import {ClientRegistry} from "@/plugins/client";
import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";

export const comfyUIParameterRegistry = new ClientRegistry<ComfyUIParameter>("comfyuiParameter");