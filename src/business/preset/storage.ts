// src/business/preset/storage.ts
import {ModelStorage} from "@/src/model/storage";
import {PresetModel} from "./index";

const storage = new ModelStorage<PresetModel>("preset",)
export default storage;