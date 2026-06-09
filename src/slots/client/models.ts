import {createModelContextType, useModelContext} from "@/components/template/models";
import {moduleName, SlotModel} from "../models";


export const SlotContext = createModelContextType<SlotModel>();
export const useSlotContext = (t: any) =>
    useModelContext<SlotModel>(SlotContext, moduleName, t)