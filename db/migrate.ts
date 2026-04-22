// db/migrate.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
    url: "file:secyud-tavern.db",
});

const db = drizzle(client);

await migrate(db, { migrationsFolder: "./db/migrations" });

console.log("数据库迁移完成");