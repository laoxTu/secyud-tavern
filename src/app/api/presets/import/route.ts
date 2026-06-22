import {interceptor} from "@/handler/server/interceptor";
import {presetRepository as repository} from "@/presets/server/repository";
import {NextResponse} from "next/server";
import {splitPNGAndDataUniversal} from "@/utils/png";
import {imageRepository} from "@/business/server/image-repository";
import {PresetModel} from "@/presets/models";
import {eq} from "drizzle-orm";

/**
 * 创建预设
 * @response {id: string}
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request) => {
        const buffer = await request.arrayBuffer();
        const data = splitPNGAndDataUniversal(buffer);
        const model: PresetModel = JSON.parse(data.extraString);
        if (data.imageData) {
            const imgBuffer = Buffer.from(data.imageData);
            model.content.coverId = await imageRepository.create(imgBuffer, "image/png");
        }

        const exist = await repository.get(model.code, false, e => (eq(e.code, model.code)));
        if (exist) {
            await repository.delete(exist.id);
        }

        await repository.create(model);

        return NextResponse.json(null);
    }
)