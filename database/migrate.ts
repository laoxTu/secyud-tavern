import {databaseManager} from "@/business/server/database"

await databaseManager.migrate();