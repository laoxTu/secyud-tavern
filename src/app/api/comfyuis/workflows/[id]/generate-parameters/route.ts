import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {comfyuiWorkflowRepository} from "@/modules/comfyui/server/repository";
import {
    ComfyUIParameterModel,
    ComfyUIWorkflowInput,
    parameterEntryName,
    parameterEntryPlural
} from "@/modules/comfyui/models";
import {LoraConfig} from "@/modules/comfyui/parameters/power-lora-selector/model";

/**
 * @pathParams { id:string }
 * @body any
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;
        const model = await comfyuiWorkflowRepository.get(id, true);

        if (model) {
            const workflow: ComfyUIWorkflowInput = JSON.parse(model.content.workflow);
            const parameters: ComfyUIParameterModel[] = model.entries![parameterEntryPlural];
            for (const nodeId of Object.keys(workflow)) {
                const node = workflow[nodeId];
                // 生成参数，positive，power lora， diffusion model 是必须的。回调也检测一下。
                if (node.inputs["unet_name"]) {
                    await addParameter({
                        disabled: false, id: 0, priority: 0,
                        code: `diffusion_model_${nodeId}`,
                        name: "diffusion_model",
                        type: "model_selector",
                        config: {
                            type: 'diffusion_model',
                            nodeId: nodeId,
                            nodeName: 'unet_name',
                            defaultValue: node.inputs["unet_name"],
                        },
                    });
                }
                if (node._meta.title.toLocaleLowerCase().startsWith("positive") &&
                    node.inputs["text"]) {
                    await addParameter({
                        disabled: false, id: 0, priority: 0,
                        code: `positive_prompt_${nodeId}`,
                        name: "positive_prompt",
                        type: "llm_text_editor",
                        config: {
                            nodeId: nodeId,
                            nodeName: 'text',
                            textPrompt: '',
                        },
                    });
                }
                if (node.class_type === 'Power Lora Loader (rgthree)') {
                    const loras: LoraConfig[] = [];
                    for (let i = 0; i < 10; i++) {
                        const key = `lora_${i + 1}`;
                        if (node.inputs[key]) {
                            loras.push(node.inputs[key]);
                        } else {
                            break;
                        }
                    }
                    await addParameter({
                        disabled: false, id: 0, priority: 0,
                        code: `power_lora_${nodeId}`,
                        name: "power_lora",
                        type: "power_lora_selector",
                        config: {
                            nodeId: nodeId,
                            defaultValue: loras,
                        },
                    });
                }
                if (node.class_type === 'Form Post Request Node') {

                    await addParameter({
                        disabled: false, id: 0, priority: 0,
                        code: `callback_${nodeId}`,
                        name: "callback",
                        type: "image_callback",
                        config: {
                            nodeId: nodeId
                        },
                    })
                }
            }

            async function addParameter(parameter: ComfyUIParameterModel) {
                const index = parameters.findIndex(u => u.code === parameter.code);
                if (index >= 0) {
                    const exist = parameters[index];
                    await comfyuiWorkflowRepository.entry.update(id, parameterEntryName, exist.id, parameter);
                    parameter.id = exist.id;
                    parameters[index] = parameter;
                } else {
                    parameters.push(parameter);
                    parameter.id = await comfyuiWorkflowRepository.entry.create(id, parameterEntryName, parameter);
                }
            }
        }

        return NextResponse.json(null);
    }
)
