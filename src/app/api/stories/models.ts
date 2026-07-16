import {TemplateConfig} from "@/app/api/template";
import {StoryModel} from "@/modules/stories/models";
import {and, like, SQL} from "drizzle-orm";
import {Check} from "@/handler/models";
import {storyRepository} from "@/modules/stories/server/repository";

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