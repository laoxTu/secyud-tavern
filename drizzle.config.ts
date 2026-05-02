import type {Config} from "drizzle-kit";
import {dbMigrationFolder, dbUrl} from "@/server/database/manager";

export default {
    schema: "src/server/**/database.ts",
    out: dbMigrationFolder,
    dialect: "sqlite",
    dbCredentials: {
        url: dbUrl,
    },
} satisfies Config;