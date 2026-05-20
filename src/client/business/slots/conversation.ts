'use client';
import {Registerable, Registry} from "@/shared/register";
import {LlmInputModel, SlotModel, StoryHistory} from "@/shared/business/slots";


// --- Contexts

export interface LlmInputContext extends LlmInputModel {
    slot: SlotModel;
}

export interface LlmOutputContext {
    content: any;
    history: StoryHistory,
    slot: SlotModel;
}

export interface RenderContext {
    document: Document;
    history: StoryHistory,
    slot: SlotModel;
}

// --- Provider ---

export interface ConversationProvider extends Registerable {
    onProcessInput(ctx: LlmInputContext): Promise<void>;

    onProcessOutput(ctx: LlmOutputContext): Promise<void>;

    onRenderPage(ctx: RenderContext): Promise<void>;
}

export class ConversationProviderManager extends Registry<ConversationProvider> {
}
