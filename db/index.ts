// db/index.js
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
    url: "file:secyud-tavern.db",
});

export const db = drizzle(client);