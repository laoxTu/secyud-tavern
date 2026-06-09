import type {Config} from "drizzle-kit";
import {dbMigrationFolder, dbUrl} from "@/business/server/database";

export default {
    schema: "src/**/db-entities.ts",
    out: dbMigrationFolder,
    dialect: "sqlite",
    dbCredentials: {
        url: dbUrl,
    },
} satisfies Config;