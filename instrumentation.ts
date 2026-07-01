// instrumentation.ts

import {databaseManager} from "@/business/server/database";

export async function register() {
    await databaseManager.migrate();
}