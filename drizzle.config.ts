import type { Config } from "drizzle-kit";

export default {
    schema: "./db/schema/*.ts",
    out: "./db/migrations",
    dialect: "sqlite",
    dbCredentials: {
        url: "file:secyud-tavern.db",
    },
} satisfies Config;