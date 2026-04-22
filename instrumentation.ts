// instrumentation.ts
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { migrate } = await import("drizzle-orm/libsql/migrator");
        const { db } = await import("./db");

        await migrate(db, { migrationsFolder: "./db/migrations" });
        console.log("数据库迁移完成");
    }
}