import {createRepository} from "@/business/server/repository";
import {PresetModel} from "@/modules/presets/models";
import {presetEntries, presets} from "@/modules/presets/server/db-entities";
import {presetStorage} from "@/modules/presets/server/storage";
import {eq} from "drizzle-orm";

export const presetRepository =
    {
        ...createRepository<PresetModel, typeof presets.$inferSelect>(
            presets, presetEntries, presetStorage,
            (model) => ({
                code: model.code,
                version: model.version,
                tags: model.tags,
                requires: model.requires,
            }),
            (entity): Partial<PresetModel> => ({
                code: entity.code,
                version: entity.version,
                tags: entity.tags,
                requires: entity.requires,
            })),
        getWithRequires: async (allCodes: string[]) => {
            const presetsWithDetails: PresetModel[] = [];
            const visited: Set<string> = new Set<string>();
            const codes = [...allCodes];

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

            return presetsWithDetails;
        }
    }
