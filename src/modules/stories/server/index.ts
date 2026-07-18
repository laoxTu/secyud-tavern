
import { storyStorage} from "./storage";
import {imageStorageProvider} from "@/modules/stories/server/image-storage";


export function registerStoryServer() {
    storyStorage.register(imageStorageProvider)
}