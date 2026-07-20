import {ComfyUIModelImporter} from "@/modules/comfyui/server/impoter-models";
import {ComfyUIModelModel} from "@/modules/comfyui/models";
import {importerName} from "../models";
import {execSync} from "node:child_process";
import path from "path";
import {ensureDir} from "@/utils/download";

export const civitaiModelImporter: ComfyUIModelImporter = {
    id: importerName,
    async download(model: ComfyUIModelModel, downloadPath: string): Promise<void> {
        await ensureDir(path.dirname(downloadPath));
        const command = `curl -L -o ${downloadPath} ${model.content.downloadUrl}`;
        console.info(`[command] ${command}`);
        execSync(command);
    },
}