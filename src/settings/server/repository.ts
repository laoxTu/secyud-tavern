import {databaseManager} from "@/business/server/database";
import {eq} from "drizzle-orm";
import {SettingModel} from "@/settings/models";
import {settings} from "@/settings/server/db-entities";

const db = databaseManager.db;
export const settingRepository = {
    set: async (model: SettingModel) => {
        const entity =
            await db.select().from(settings)
                .where(eq(settings.id, model.id))
                .get();
        if (entity) {
            await db
                .update(settings)
                .set({...model,})
                .where(eq(settings.id, model.id));
        } else {
            await db
                .insert(settings)
                .values(model);
        }
    },
    get: async (id: string): Promise<SettingModel | undefined> => {
        return await db.select().from(settings)
            .where(eq(settings.id, id)).get();
    },
};