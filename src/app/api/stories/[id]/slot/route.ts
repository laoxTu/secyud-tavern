import {NextResponse} from "next/server";
import {BusinessError} from "@/handler/models";
import {storyRepository} from "@/modules/stories/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {getSlot} from "@/app/api/stories/models";

/**
 * 获取故事及其依赖的所有预设（含详情）
 * @pathParams { id:string }
 * @response SlotModel
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.params;

        const story = await storyRepository.get(id, undefined, {withDetails: true});

        if (!story) {
            throw new BusinessError(
                'entity not found',
                "default.entity_not_found")
                .withValue("id", id);
        }

        const result = await getSlot(story);

        return NextResponse.json(result);
    }
);
