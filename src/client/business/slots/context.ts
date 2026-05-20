import {createModelContextType, useModelContext} from "@/client/business/template/context";
import {SlotModel, name as modelType} from "@/shared/business/slots";


export const SlotContext = createModelContextType<SlotModel>();
export const useSlotContext = (t: any) =>
    useModelContext<SlotModel>(SlotContext, modelType, t)