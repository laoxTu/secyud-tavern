import {ModelStorage} from "@/business/server/storage";
import {LlmapiModel, moduleName} from "../models";

export const llmapiStorage = new ModelStorage<LlmapiModel>(moduleName,)
