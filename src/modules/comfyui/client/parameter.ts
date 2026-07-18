import {ClientRegistry} from "@/plugins/client";
import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";

export class ComfyUIParameterRegistry extends ClientRegistry<ComfyUIParameter> {
}

export const comfyUIParameterRegistry = new ComfyUIParameterRegistry("comfyuiParameter");