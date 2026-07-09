import {LlmapiInputBuilder} from "./input-builder-models";
import {llmapiLorebookInputBuilder} from "@/engines/lorebooks/client/input-builder";
import {ClientRegistry} from "@/plugins/client";

export class LlmapiInputBuilderManager extends ClientRegistry<LlmapiInputBuilder> {
    constructor(builders: LlmapiInputBuilder[]) {
        super("inputBuilderManager");
        for (const builder of builders) {
            this.register(builder);
        }
    }
}

export const llmapiInputBuilderManager = new LlmapiInputBuilderManager([
    llmapiLorebookInputBuilder
]);