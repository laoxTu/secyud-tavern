import {TemplateConfig} from "@/app/api/template";
import {and, eq, like, not, or, SQL} from "drizzle-orm";
import {LlmapiModel} from "@/modules/llmapis/models";
import {llmapiRepository} from "@/modules/llmapis/server/repository";
import {validate} from "uuid";
import {BusinessError, Check} from "@/handler/models";
import {presetRepository as repository} from "@/modules/presets/server/repository";
import {hasher} from "@/utils/server/hasher";

export const apiConfig: TemplateConfig<LlmapiModel> = {
    repository: llmapiRepository,
    checkCreate: async (model) => {
        Check.NotEmpty('code', model.code);
        Check.NotEmpty('name', model.name);
        if (await repository.exist(e => (eq(e.code, model.code)))) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.llmapi")
                ;
        }
    },
    checkUpdate: async (id, model) => {
        Check.NotEmpty('code', model.code);
        Check.NotEmpty('name', model.name);
        if (await repository.exist(e => (and(eq(e.code, model.code), not(eq(e.id, id)))) as SQL)) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.llmapi")
                ;
        }
        if (model.key) {
            model.key = hasher.encrypt(model.key);
        }
    },
    importHandler: undefined,
    exportHandler: undefined,
    conditionSearch: (search) => (table) => {
        const conditions: SQL[] = [];
        const fuzzy = search?.fuzzy;
        if (fuzzy) {
            conditions.push(or(
                like(table.name, `%${fuzzy}%`),
                like(table.code, `%${fuzzy}%`)
            ) as SQL);
        }
        return and(...conditions) as SQL;
    },
    conditionMatchId: id => table => validate(id) ? eq(table.id, id) : eq(table.code, id),
    filename: model => `api-${model.code}.json`,
}