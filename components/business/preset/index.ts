// pages/preset/index.ts
import {TabManager} from "@/components/tab";
import {PresetModel} from "@/src/business/preset/models";



export const tabManager = new TabManager<{ preset: PresetModel }>("preset tabs");