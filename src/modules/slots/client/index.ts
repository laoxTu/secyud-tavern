
import {slotFeatureManager} from "@/modules/slots/client/feature";
import {historyDefaultFeature} from "@/modules/slots/client/history-feature";



export function registerSlotClient() {
    slotFeatureManager.register(
        historyDefaultFeature
    );
}