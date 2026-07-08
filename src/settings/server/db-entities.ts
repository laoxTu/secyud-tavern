import {sqliteTable, text} from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
    id: text("id").primaryKey(),
    data: text("data"),
})