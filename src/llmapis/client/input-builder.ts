import {Registry} from "@/utils/register";
import {LlmapiInputBuilder} from "./input-builder-models";
import {llmapiLorebookInputBuilder} from "@/engines/lorebooks/client/input-builder";

export class LlmapiInputBuilderManager extends Registry<LlmapiInputBuilder> {
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