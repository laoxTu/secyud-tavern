import {def} from "@/plugins/client/api";
import * as conversation from "@/slots/client/conversation";


def("@/slots/client/conversation", conversation);
export function registerSlotClient() {
}