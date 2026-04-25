// src/database/migrate.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import {dbMigrationFolder, dbUrl} from "./index";

const client = createClient({
    url: dbUrl,
});

const db = drizzle(client);

await migrate(db, { migrationsFolder: dbMigrationFolder });

console.log("[database] database migrated successfully");