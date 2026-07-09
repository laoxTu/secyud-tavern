import {ModelStorage} from "@/business/server/storage";
import {LlmapiModel, moduleName} from "../models";

export const llmapiStorage = ModelStorage.getInstance<LlmapiModel>(moduleName,)
