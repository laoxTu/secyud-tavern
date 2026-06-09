
// --- Contexts

import {Registerable} from "@/utils/register";
import {LlmInputModel, SlotModel} from "@/slots/models";
import {StoryHistory} from "@/stories/models";

export interface SlotInitializeContext {
    slot: SlotModel;
    content: Record<string, any>;
}

export interface LlmInputContext extends LlmInputModel {
    slot: SlotModel;
    userInput: string;
    content: Record<string, any>;
}

export interface LlmOutputContext {
    content: Record<string, any>;
    history: StoryHistory,
    slot: SlotModel;
}

export interface RenderContext {
    content: Record<string, any>;
    document: Document;
    history: StoryHistory,
    slot: SlotModel;
}

export interface RenderStreamContext {
    content: Record<string, any>;
    document: Document;
    history: StoryHistory,
    slot: SlotModel;
    stream: string;
}

// --- Provider ---

export interface ConversationProvider extends Registerable {
    onInitialize(ctx: SlotInitializeContext): Promise<void>;

    onProcessInput(ctx: LlmInputContext): Promise<void>;

    onProcessOutput(ctx: LlmOutputContext): Promise<void>;

    onRenderPage(ctx: RenderContext): Promise<void>;

    onRenderStream(ctx: RenderStreamContext): Promise<void>;
}
