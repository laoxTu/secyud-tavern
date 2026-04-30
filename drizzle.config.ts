import type {Config} from "drizzle-kit";
import {dbMigrationFolder, dbUrl} from "./src/server/database/manager";

export default {
    schema: "src/**/db.ts",
    out: dbMigrationFolder,
    dialect: "sqlite",
    dbCredentials: {
        url: dbUrl,
    },
} satisfies Config;