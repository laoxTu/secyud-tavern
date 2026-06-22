import {sqliteTable, text} from "drizzle-orm/sqlite-core";


export const imageFiles = sqliteTable("image_file", {
    // id 作为主键（GUID），其他表通过这个字段关联
    id: text("id").primaryKey(),
    // sha256 唯一索引，用于查重
    sha256: text("sha256").notNull().unique(),
    type: text("type").notNull(),
})