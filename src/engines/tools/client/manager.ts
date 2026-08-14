import {ClientRegistry} from "@/plugins/client";
import {LlmapiToolProvider} from "@/engines/tools/client/models";

export const llmapiToolManager = new ClientRegistry<LlmapiToolProvider>("llmapiToolManager");
