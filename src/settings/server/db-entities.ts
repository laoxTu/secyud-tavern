import {sqliteTable, text} from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("setting", {
    id: text("id").primaryKey(),
    data: text("data"),
})