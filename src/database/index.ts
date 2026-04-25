// src/database/index.ts
import {createClient} from "@libsql/client";
import {drizzle} from "drizzle-orm/libsql";

export const dbUrl = "file:database/secyud-tavern.database";
export const dbMigrationFolder = "database/migrations";

const client = createClient({
    url: dbUrl,
});

export const db = drizzle(client);

export async function createDb() {
    const {migrate} = await import("drizzle-orm/libsql/migrator");
    await migrate(db, {migrationsFolder: dbMigrationFolder});

    console.log("[database] database migrated successfully");
}