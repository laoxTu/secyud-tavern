import {InjectContext, LlmapiInputContext, slotUtils} from "@/modules/stories/client/conversation-models";
import {historyUtils, SlotHistory} from "@/modules/models";
import {toolUtils} from "@/engines/tools/client/conversation";
import {joinAsString} from "@/utils";

export const getKnowledgeTool =
    {
        name: "get_knowledge",
        description: "get knowledge. return empty if current knowledge is injected. ",
    }

export async function generateMessageWithBuilder(
    {
        slot,
        histories,
        contentHandlers,
        injectorCreators,
        current,
    }: LlmapiInputContext,
    ctx: InjectContext) {
    const {pushToolMessage, pushUserMessage, pushAiMessage} = ctx;
    const handlers = await Promise.all(
        injectorCreators.map(u => u(ctx))
    );
    for (let i = 0; i < histories.length; i++) {
        const history = histories[i];

        for (const handler of handlers) {
            await handler.before?.(i);
        }

        await generateInput(history);

        for (const handler of handlers) {
            await handler.middle?.(i);
        }

        if (i < histories.length - 1 || current)
            await generateOutputs(history);

        for (const handler of handlers) {
            await handler.after?.(i);
        }
    }

    async function generateOutputs(history: SlotHistory) {
        const outputs = historyUtils.getOutputs(history);
        if (!outputs) return;
        for (const output of outputs) {
            const content = await generateContent(output.content, "assistant", "output");
            // 检验工具是否触发
            await toolUtils.callTools(slot, output.callings);
            const callings = output.callings
                ?.filter(u => !u.result?.hidden);
            if (callings?.length) {
                pushToolMessage(callings, content, output);
            } else if (content) {
                pushAiMessage(content, output);
            }
        }
    }

    async function generateInput(history: SlotHistory) {
        if (!history.inputs.length) return;
        const input = joinAsString(history.inputs, "\r\n", u => u.content);
        const content = await generateContent(input, "user", "input");
        if (content) pushUserMessage(content)
    }

    async function generateContent(str: string, role: string, type: string) {
        return await slotUtils.handleContent(contentHandlers, {str, role, type});
    }
}