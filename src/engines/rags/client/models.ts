import {Orama, Vector} from "@orama/orama";
import {StoryHistoryMessage} from "@/modules/slots/models";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {remoteStorage} from "@/modules/settings/client/storage";
import {Registerable} from "@/utils/register";

export const ragVectorSchema = {
    name: 'string',
} as const;

export type RagVectorSchema = typeof ragVectorSchema & { embedding: Vector };

interface RagConversationCacheBase {
    lorebookDb: Orama<RagVectorSchema>,
    generator: RagEmbeddingGenerator,
    disabled: false,
}

export type RagConversationCache = RagConversationCacheBase | { disabled: true }

export interface RagSearchContext extends RagConversationCacheBase {
    message: StoryHistoryMessage;
}

export interface RagEmbeddingContext {
    content: string;
}

export interface RagEmbeddingGenerator {
    embeddingDimension: number;
    generateEmbedding: (ctx: RagEmbeddingContext) => Promise<number[]>;
}

export interface RagEmbeddingGeneratorProvider extends Registerable {
    component: React.ComponentType,
    getValue: (data: FormData) => Record<string, any>,
    getGenerator: () => Promise<RagEmbeddingGenerator>;
}

export interface RagSettingState {
    embeddingGenerator: string;
    disabled: boolean;
    embeddingGeneratorConfig: Record<string, any>;
}

export const useRagSettingState = create<RagSettingState>()(
    persist<RagSettingState>(() => ({
            embeddingGenerator: "transformers",
            embeddingGeneratorConfig: {},
            disabled: false,
        }),
        {
            name: "ragSettingState",
            storage: createJSONStorage(() => remoteStorage),
            partialize: (state) => ({
                disabled: state.disabled,
                embeddingGenerator: state.embeddingGenerator,
                embeddingGeneratorConfig: state.embeddingGeneratorConfig,
            }),
        }
    )
);
