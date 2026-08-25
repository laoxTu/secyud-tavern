import { memoryStorageProvider} from "./storage";
import {storyStorage} from "@/modules/stories/server/storage";


export function registerMemoriesServer() {
    storyStorage.register(memoryStorageProvider)
}