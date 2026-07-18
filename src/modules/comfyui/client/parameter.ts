import {ClientRegistry} from "@/plugins/client";
import {ComfyUIParameter} from "@/modules/comfyui/client/parameter-model";
import {modelSelector} from "@/modules/comfyui/parameters/model-selector/client";
import {powerLoraSelector} from "@/modules/comfyui/parameters/power-lora-selector/client";
import {textEditor} from "@/modules/comfyui/parameters/text-editor/client";
import {llmTextEditor} from "@/modules/comfyui/parameters/llm-text-editor/client";
import {numberEditor} from "@/modules/comfyui/parameters/number-editor/client";
import {imageCallback} from "@/modules/comfyui/parameters/image-callback/client";

export class ComfyUIParameterRegistry extends ClientRegistry<ComfyUIParameter> {
}

export const comfyUIParameterRegistry = new ComfyUIParameterRegistry("comfyuiParameter",
    modelSelector, powerLoraSelector, textEditor, numberEditor, llmTextEditor, imageCallback);