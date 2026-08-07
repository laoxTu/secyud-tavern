import {eq} from "drizzle-orm";
import {presetRepository} from "@/modules/presets/server/repository";
import {NextResponse} from "next/server";
import type {PresetModel} from "@/modules/presets/models";
import {BusinessError} from "@/handler/models";
import {storyRepository} from "@/modules/stories/server/repository";
import {llmapiRepository} from "@/modules/llmapis/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {SlotModel} from "@/modules/slots/models";
import {StoryHistory} from "@/modules/stories/models";
import {EntryModel} from "@/business/models";

/**
 * 获取故事及其依赖的所有预设（含详情）
 * @pathParams { id:string }
 * @response SlotModel
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.params;

        const story = await storyRepository.get(id, true);

        if (!story) {
            throw new BusinessError('entity not found', "default.entity_not_found")
                .withValue("id", id);
        }
        if (!story.llmapi) {
            throw new BusinessError('story has no llmapi config', "default.story_lack_config_llmapi")
                .withValue("id", id);
        }

        const llmapi = await llmapiRepository.get(
            story.llmapi.code, true,
            table => eq(table.code, story.llmapi?.code));

        if (!llmapi) {
            throw new BusinessError('llmapi config not found', "default.llmapi_config_notfound")
                .withValue("id", id);
        }

        const histories = (await storyRepository.entry.getList(story.id, "history")).data as (StoryHistory & EntryModel)[];
        histories.sort((a, b) => a.id - b.id);
        story.histories = histories;

        const presets: PresetModel[] = await presetRepository
            .getWithRequires(story.requires.map(u => u.code));

        const slot: SlotModel = {
            id: id,
            name: story.name,
            content: {},
            story,
            llmapi,
            presets,
        };

        return NextResponse.json(slot);
    }
);
