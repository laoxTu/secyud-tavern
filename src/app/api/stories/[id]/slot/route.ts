import {presetRepository} from "@/modules/presets/server/repository";
import {NextResponse} from "next/server";
import type {PresetModel} from "@/modules/presets/models";
import {BusinessError} from "@/handler/models";
import {storyRepository} from "@/modules/stories/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {SlotModel} from "@/modules/slots/models";
import {SlotHistory} from "@/modules/models";
import {EntryModel} from "@/business/models";
import {llmapiRepository} from "@/modules/llmapis/server/repository";
import {eq} from "drizzle-orm";

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
            throw new BusinessError(
                'entity not found',
                "default.entity_not_found")
                .withValue("id", id);
        }

        if (!story.llmapi) {
            throw new BusinessError(
                'story has no llmapi config',
                "default.story_lack_config_llmapi")
                .withValue("id", id);
        }
        const llmapi = await llmapiRepository.get(
            story.llmapi.code, true,
            table => eq(table.code, story.llmapi?.code));

        if (!llmapi) {
            throw new BusinessError('llmapi config not found', "default.llmapi_config_notfound")
                .withValue("id", id);
        }

        const histories = (await storyRepository.entry.getList(story.id, "history")).data as (SlotHistory & EntryModel)[];
        histories.sort((a, b) => a.id - b.id);

        const presets: PresetModel[] = await presetRepository
            .getWithRequires(story.requires.map(u => u.code));

        const slot: SlotModel = {
            ...story,
            histories,
            llmapi,
            presets,
            context: {}
        };

        return NextResponse.json(slot);
    }
);
