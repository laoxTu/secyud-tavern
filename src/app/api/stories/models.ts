import {TemplateConfig} from "@/app/api/template";
import {StoryModel} from "@/modules/stories/models";
import {and, eq, like, SQL} from "drizzle-orm";
import {BusinessError, Check} from "@/handler/models";
import {storyRepository} from "@/modules/stories/server/repository";
import {SlotModel} from "@/modules/stories/models";
import {llmapiRepository} from "@/modules/llmapis/server/repository";
import {SlotHistory} from "@/modules/models";
import {EntryModel} from "@/business/models";
import type {PresetModel} from "@/modules/presets/models";
import {presetRepository} from "@/modules/presets/server/repository";

export async function getSlot(story: StoryModel): Promise<SlotModel> {
    if (!story.llmapi) {
        throw new BusinessError(
            'story has no llmapi config',
            "default.story_lack_config_llmapi")
            .withValue("id", story.id);
    }

    const llmapi = await llmapiRepository.get(
        story.llmapi.code,
        table => eq(table.code, story.llmapi?.code),
        {
            withDetails: true,
        });

    if (!llmapi) {
        throw new BusinessError('llmapi config not found', "default.llmapi_config_notfound")
            .withValue("id", story.id);
    }

    const histories = (await storyRepository.entry.getList(story.id, "history")).data as (SlotHistory & EntryModel)[];
    histories.sort((a, b) => a.id - b.id);

    const presets: PresetModel[] = await presetRepository
        .getWithRequires(story.requires.map(u => u.code));

    return {
        ...story,
        histories,
        llmapi,
        presets,
        properties: {}
    };
}

export const apiConfig: TemplateConfig<StoryModel> = {
    repository: storyRepository,
    checkCreate: async (model) => {
        Check.NotEmpty('name', model.name);
    },
    checkUpdate: async (_, model) => {
        Check.NotEmpty('name', model.name);
    },
    importHandler: undefined,
    exportHandler: undefined,
    conditionSearch: (search) => (table) => {
        const conditions: SQL[] = [];
        const fuzzy = search?.fuzzy;
        if (fuzzy) {
            conditions.push(like(table.name, `%${fuzzy}%`) as SQL);
        }

        return and(...conditions) as SQL;
    },
    conditionMatchId: undefined,
    filename: model => `story-${model.id}.json`,
}