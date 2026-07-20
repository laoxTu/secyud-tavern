import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {comfyuiModelRepository} from "@/modules/comfyui/server/repository";
import {BusinessError} from "@/handler/models";
import {settingRepository} from "@/modules/settings/server/repository";
import {ComfyUIModelContentModel} from "@/modules/comfyui/models";
import fs from "fs/promises";
import {downloadFile} from "@/utils/download";
import {task} from "@/utils/server/task";
import {comfyUIModelImporterRegistry} from "@/modules/comfyui/server/impoter";

/**
 * @pathParams { id:string }
 * @response any
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (_, records) => {
        const {id} = await records.context.params;
        const model = await comfyuiModelRepository.get(id);

        if (!model)
            throw new BusinessError('entity not found.',
                "default.entity_not_found")
                .withValue("id", id);


        const setting = await settingRepository.get("comfyuiSettingState");
        const {state: {modelDir}} = setting?.data ? JSON.parse(setting.data) : {
            state: {
                modelDir: ""
            }
        };

        if (!modelDir)
            throw new BusinessError('model dir is empty.', "comfyui.invalid_model_dir");

        const content = model.content as ComfyUIModelContentModel;

        const downloadUrl = content.downloadUrl;
        if (!downloadUrl)
            throw new BusinessError('download url is empty.', "comfyui.invalid_download_url");

        if (!content.path)
            throw new BusinessError('path is empty.', "comfyui.invalid_path");

        const downloadPath = `${modelDir}/${{
            "vae": "vae",
            "diffusion_model": "diffusion_models",
            "lora": "loras",
            "text_encoder": "text_encoders",
            "checkpoint": "checkpoints"
        }[model.type] ?? "loras"}/${content.path}`;

        const exists = await (async () => {
            try {
                const stats = await fs.stat(downloadPath);
                if (stats.size > 0) {
                    return true;
                }
            } catch {
                return false;
            }
        })();

        if (exists) {
            throw new BusinessError('file is exists.', "comfyui.file_exists");
        }

        const importer = content.importer ? comfyUIModelImporterRegistry.records[content.importer] : undefined;

        await task.create(`comfyui_model_download ${downloadPath}`, async () => {
            if (importer) {
                await importer.download(model, downloadPath);
            } else {
                await downloadFile(downloadUrl, downloadPath);
            }
        });

        return NextResponse.json(null);
    }
)
