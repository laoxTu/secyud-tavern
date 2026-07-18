import {interceptor} from "@/handler/server/interceptor";
import {NextResponse} from "next/server";
import {imageRepository} from "@/business/server/image-repository";
import {storyRepository} from "@/modules/stories/server/repository";
import {imageEntryName, StoryImageModel} from "@/modules/stories/models";


/**
 * 更新条目
 * @pathParams { id:string }
 * @params {code: string, name: string}
 * @body any
 * @openapi
 */
export const POST = interceptor.createRoute(
    async (request, records) => {
        const {id, name, code} = await records.context.params;
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;
        if (imageFile) {
            const mimeType = imageFile.type;
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const imageId = await imageRepository.create(buffer, mimeType);
            const imageModel: StoryImageModel = {
                code, disabled: false, id: 0, imageId, name,
            };
            await storyRepository.entry.create(id, imageEntryName, imageModel)
        }

        return NextResponse.json(null);
    }
);