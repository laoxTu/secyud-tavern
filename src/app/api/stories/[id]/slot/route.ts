import {eq} from "drizzle-orm";
import {presetRepository} from "@/presets/server/repository";
import {NextResponse} from "next/server";
import type {PresetModel} from "@/presets/models";
import {BusinessError} from "@/handler/models";
import {storyRepository} from "@/stories/server/repository";
import {llmapiRepository} from "@/llmapis/server/repository";
import {interceptor} from "@/handler/server/interceptor";
import {presets} from "@/presets/server/db-entities";
import {SlotModel} from "@/slots/models";
import {StoryHistory} from "@/stories/models";
import {EntryModel} from "@/business/models";

/**
 * 获取故事及其依赖的所有预设（含详情）
 * @pathParams { id:string }
 * @response SlotModel
 * @openapi
 */
export const GET = interceptor.createRoute(
    async (request, records) => {
        const {id} = await records.context.params;

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

        const presetsWithDetails: PresetModel[] = [];
        const visited: Set<string> = new Set<string>();
        const codes = story.requires.map(u => u.code);

        while (codes.length > 0) {
            const code = codes.shift()!;
            const preset = await presetRepository.get(
                code, true, () => eq(presets.code, code)
            );
            if (!preset) continue;

            visited.add(preset.code);
            presetsWithDetails.push(preset);

            for (const require of preset.requires) {
                if (!visited.has(require.code)) {
                    codes.push(require.code);
                }
            }
        }


        const slot: SlotModel = {
            id: id,
            name: story.name,
            content: {},
            story,
            llmapi,
            presets: presetsWithDetails
        };

        return NextResponse.json(slot);
    }
);
