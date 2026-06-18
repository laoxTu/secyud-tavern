import {def} from "@/plugins/client/api";
import * as conversation from "@/slots/client/conversation";
import * as feature from "@/slots/client/feature";
import {slotFeatureManager} from "@/slots/client/feature";
import {historyDeleterFeature} from "@/slots/client/features/history-deleter";
import {navigateToBusinessFeature} from "@/slots/client/features/navigate-to-business";
import {regeneratorFeature} from "@/slots/client/features/regenerator";


def("@/slots/client/conversation", conversation);
def("@/slots/client/feature", feature);

export function registerSlotClient() {
    slotFeatureManager.register(
        historyDeleterFeature,
        regeneratorFeature,
        navigateToBusinessFeature,
    )
}