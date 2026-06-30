import {createClient} from "@libsql/client";
import {drizzle} from "drizzle-orm/libsql";
import {migrate} from "drizzle-orm/libsql/migrator";

export const dbUrl = "file:database/secyud-tavern.db";
export const dbMigrationFolder = "database/migrations";

export class DatabaseManager {
    readonly client = createClient({
        url: dbUrl,
    });
    readonly db = drizzle(this.client)

    async migrate() {
        await migrate(this.db, {migrationsFolder: dbMigrationFolder});
        console.info("[business manager] business migrated successfully");
    }
}

export const databaseManager = new DatabaseManager();