import {TemplateConfig} from "@/app/api/template";
import {and, eq, like, not, or, SQL} from "drizzle-orm";
import {validate} from "uuid";
import {BusinessError} from "@/handler/models";
import {comfyuiModelRepository as repository} from "@/modules/comfyui/server/repository";
import {ComfyUIModelModel} from "@/modules/comfyui/models";

export const apiConfig: TemplateConfig<ComfyUIModelModel> = {
    repository: repository,
    checkCreate: async (model) => {
        if (model.code === "") {
            throw new BusinessError("No code provided", "error.empty_field")
                .withValue("field", "default.code");
        }
        if (model.name === "") {
            throw new BusinessError("No name provided", "error.empty_field")
                .withValue("field", "default.name");
        }
        if (await repository.exist(e => (eq(e.code, model.code)))) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.comfyui_workflow")
                ;
        }
    },
    checkUpdate: async (id, model) => {
        if (model.code === "") {
            throw new BusinessError("No code provided", "error.empty_field")
                .withValue("field", "default.code");
        }
        if (model.name === "") {
            throw new BusinessError("No name provided", "error.empty_field")
                .withValue("field", "default.name");
        }
        if (await repository.exist(e => (and(eq(e.code, model.code), not(eq(e.id, id)))) as SQL)) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.comfyui_workflow")
                ;
        }
    },
    importHandler: undefined,
    exportHandler: undefined,
    conditionSearch: (search) => (table) => {
        const conditions: SQL[] = [];
        const fuzzy = search?.fuzzy;
        if (fuzzy && fuzzy !== "") {
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