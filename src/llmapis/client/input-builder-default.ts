import {LlmapiInputContext} from "@/slots/client/conversation-models";
import {
    engineArrayName,
    getLorebookOrder,
    LorebookMessage, LorebookMessageItem,
    PresetLorebookModel
} from "@/engines/lorebooks/models";
import {tryGetLastItem} from "@/utils";
import {LlmapiMessage} from "@/slots/models";

export interface MessageContext {
    lorebookS: PresetLorebookModel[];
    lorebookE: PresetLorebookModel[];
    content: string[];
    role: string;
}


export async function defaultBuildInput(ctx: LlmapiInputContext) {
    const lorebookMessages = ctx.content.messages as LorebookMessage[];
    const lorebooks = ctx.slot.content[engineArrayName] as Record<string, PresetLorebookModel>;
    const messageContexts: MessageContext[] = [];
    messageContexts.push({
        role: "system",
        content: [ctx.slot.story.content.openingRemarks ?? ""],
        lorebookE: [],
        lorebookS: [],
    });
    const visitedLorebooks = new Set<string>();
    const prepareLorebooks: PresetLorebookModel[] = [];
    for (const lorebookMessage of lorebookMessages) {
        const messageContextUser: MessageContext = {
            role: "user",
            content: [],
            lorebookE: [],
            lorebookS: [],
        }
        for (const input of lorebookMessage.inputs) {
            messageContextUser.content.push(input.message)
            fillLorebooks(input);
        }
        fillContext(messageContextUser, prepareLorebooks);
        messageContexts.push(messageContextUser);

        prepareLorebooks.length = 0;

        if (!lorebookMessage.output) continue;
        const messageContextAi: MessageContext = {
            role: "assistant",
            content: [lorebookMessage.output.message],
            lorebookE: [],
            lorebookS: [],
        }
        fillLorebooks(lorebookMessage.output);
        messageContexts.push(messageContextAi);
    }

    const lorebooksS: PresetLorebookModel[] = ctx.slot.content[engineArrayName + "S"];
    fillContext(messageContexts[0], lorebooksS);
    const lorebooksE: PresetLorebookModel[] = ctx.slot.content[engineArrayName + "E"];
    fillContext(tryGetLastItem(messageContexts)!, lorebooksE);

    const llmapiMessages: LlmapiMessage[] = [];

    const cache : {role:string, content:string[]} = {
        role: "",
        content: [],
    }
    for (const messageContext of messageContexts) {
        messageContext.lorebookS.sort(getLorebookOrder);
        messageContext.lorebookE.sort(getLorebookOrder);
        for (const lorebook of messageContext.lorebookS) {
            tryPushMessage(lorebook.role, lorebook.content);
        }
        for (const text of messageContext.content) {
            llmapiMessages.push({
                role: "user",
                content: text
            })
        }
        for (const lorebook of messageContext.lorebookE) {
            tryPushMessage(lorebook.role, lorebook.content);
        }
    }
    tryPushMessage("", "");

    return llmapiMessages;

    function fillLorebooks(message: LorebookMessageItem) {
        if (!message.lorebooks) return;

        for (const lorebook of message.lorebooks) {
            if (!lorebooks[lorebook] ||
                visitedLorebooks.has(lorebook)) continue;
            prepareLorebooks.push(lorebooks[lorebook]);
            visitedLorebooks.add(lorebook);
        }
    }

    function tryPushMessage(messageRole: string, messageContent: string) {
        if (messageRole === cache.role) {
            cache.content.push(messageContent);
        } else {
            if (cache.content.length > 0) {
                llmapiMessages.push({
                    role: cache.role,
                    content: cache.content.join("\n")
                });
            }
            cache.role = messageRole;
            cache.content.length = 0;
        }
    }

    function fillContext(context: MessageContext, lorebooks: PresetLorebookModel[]) {
        for (const lorebook of lorebooks) {
            if (lorebook.layer < 100)
                context.lorebookS.push(lorebook);
            else context.lorebookE.push(lorebook);
        }
    }
}