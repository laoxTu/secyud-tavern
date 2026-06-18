import {Registry} from "@/utils/register";
import {SlotFeature} from "@/slots/client/feeature-models";


export const slotFeatureManager = new Registry<SlotFeature>("config");