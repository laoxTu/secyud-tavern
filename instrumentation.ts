// instrumentation.ts

import {registerServerPlugins} from "@/server-registerer";
import {databaseManager} from "@/business/server/database";

export async function register() {
    await databaseManager.migrate();
    await registerServerPlugins();
}