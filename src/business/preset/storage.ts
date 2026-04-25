// src/business/preset/storage.ts
import {ModelStorage} from "@/models/storage";
import {PresetModel} from "./models";

const storage = new ModelStorage<PresetModel>("preset",)
export default storage;