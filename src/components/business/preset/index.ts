// pages/preset/index.ts
import {TabManager} from "@/components/tab";
import {PresetModel} from "@/business/preset/models";


export const tabManager = new TabManager<{ preset: PresetModel }>("preset tabs");

export {default as PresetContent} from "./nodes/PresetContent"
export {default as PresetTab} from "./nodes/PresetTab"