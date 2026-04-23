import type {Config} from "drizzle-kit";
import {dbMigrationFolder, dbUrl} from "@/src/db";

export default {
    schema: "src/**/db.ts",
    out: dbMigrationFolder,
    dialect: "sqlite",
    dbCredentials: {
        url: dbUrl,
    },
} satisfies Config;