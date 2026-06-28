
import {slotFeatureManager} from "@/slots/client/feature";
import {historyDefaultFeature} from "@/slots/client/history-feature";



export function registerSlotClient() {
    slotFeatureManager.register(
        historyDefaultFeature
    )
}