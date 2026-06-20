
import {slotFeatureManager} from "@/slots/client/feature";
import {historyDeleterFeature} from "@/slots/client/features/history-deleter";
import {navigateToBusinessFeature} from "@/slots/client/features/navigate-to-business";
import {regeneratorFeature} from "@/slots/client/features/regenerator";
import {historyEditorFeature} from "@/slots/client/features/history-editor";



export function registerSlotClient() {
    slotFeatureManager.register(
        historyDeleterFeature,
        regeneratorFeature,
        historyEditorFeature,
        navigateToBusinessFeature,
    )
}