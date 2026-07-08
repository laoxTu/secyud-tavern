import {Orama, Vector} from "@orama/orama";
import {StoryHistoryMessage} from "@/stories/models";
import {Registerable} from "@/utils/register";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {remoteStorage} from "@/settings/client/models";
import {ComponentType} from "react";


export const ragVectorSchema = {
    name: 'string',
} as const;

export type RagVectorSchema = typeof ragVectorSchema & { embedding: Vector };


export interface RagConversationCache {
    lorebookDb?: Orama<RagVectorSchema>;
    generator?: RagEmbeddingGenerator;
}


export interface RagSearchContext extends RagConversationCache {
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
    editor: ComponentType,
    getEditorValue: (data: FormData) => Record<string, any>,
    getGenerator: () => Promise<RagEmbeddingGenerator>;
}

export interface RagSettingState {
    embeddingGenerator: string;
    disabled: boolean;
    embeddingGeneratorConfig: Record<string, any>;
}

export const useRagSettingState = create<RagSettingState>()(
    persist<RagSettingState>(() => ({
            embeddingGenerator: "",
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
