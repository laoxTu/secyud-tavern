import {TemplateConfig} from "@/app/api/template";
import {and, eq, like, not, or, SQL} from "drizzle-orm";
import {presetRepository as repository, presetRepository} from "@/modules/presets/server/repository";
import {PresetModel} from "@/modules/presets/models";
import {validate} from "uuid";
import {splitPNGAndDataUniversal} from "@/utils/png";
import {imageRepository} from "@/business/server/image-repository";
import {BusinessError, Check} from "@/handler/models";

export const apiConfig: TemplateConfig<PresetModel> = {
    repository: presetRepository,
    checkCreate: async (model) => {
        Check.NotEmpty('code', model.code);
        Check.NotEmpty('name', model.name);
        if (await repository.exist(e => (eq(e.code, model.code)))) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.preset")
                ;
        }
    },
    checkUpdate: async (id, model) => {
        Check.NotEmpty('code', model.code);
        Check.NotEmpty('name', model.name);
        if (await repository.exist(e => (and(eq(e.code, model.code), not(eq(e.id, id)))) as SQL)) {
            throw new BusinessError("Code already exists", "error.duplicate_field")
                .withValue("field", "default.code")
                .withValue("entity_name", "default.preset")
                ;
        }
    },
    importHandler: async (uint8) => {
        const data = splitPNGAndDataUniversal(uint8);
        const model: PresetModel = JSON.parse(new TextDecoder().decode(data.extraData));
        if (data.imageData) {
            const imgBuffer = Buffer.from(data.imageData);
            model.content.coverId = await imageRepository.create(imgBuffer, "image/png");
        }
        return model;
    },
    exportHandler: async (model, uint8arr) => {
        const coverId = model.content.coverId;
        const image =
            coverId ? await imageRepository.get(coverId) : null;

        return new ReadableStream({
            start(controller) {
                if (image?.buffer) {
                    controller.enqueue(image.buffer);
                }
                controller.enqueue(uint8arr);
                controller.close();  // 关闭流
            }
        });
    },
    conditionSearch: (search) => (table) => {
        const conditions: SQL[] = [];
        const fuzzy = search?.fuzzy;
        if (fuzzy) {
            conditions.push(or(
                like(table.name, `%${fuzzy}%`),
                like(table.code, `%${fuzzy}%`)
            ) as SQL);
        }
        const tags: string[] = search?.tags ?? [];
        if (tags.length > 0) {
            conditions.push(or(
                ...tags.map(u => like(table.tags, `%${u}%`))
            ) as SQL);
        }
        return and(...conditions) as SQL;
    },
    conditionMatchId: id => table => validate(id) ? eq(table.id, id) : eq(table.code, id),
    filename: model => `preset-${model.content.author}-${model.code}-${model.version}.${model.content.coverId ? 'png' : 'json'}`,
}