import {NextResponse} from "next/server";
import {BusinessError} from "@/handler/models";
import {interceptor} from "@/handler/server/interceptor";
import {StoryModel} from "@/modules/stories/models";
import {getSlot} from "@/app/api/stories/models";

/**
 * 获取故事及其依赖的所有预设（含详情）
 * @pathParams { id:string }
 * @response SlotModel
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const story = records.searchParams as StoryModel;

        if (!story) {
            throw new BusinessError(
                'entity not found',
                "default.entity_not_found")
                .withValue("id", "story");
        }

        const result = await getSlot(story);

        return NextResponse.json(result);
    }
);
