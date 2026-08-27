import {create as createSchema, Orama} from "@orama/orama";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {remoteStorage} from "@/modules/settings/client/storage";
import {Registerable} from "@/utils/register";
import {embeddingGeneratorManager} from "@/engines/rags/client/embedding";
import React from "react";

export interface EmbeddingContext {
    content: string,
}

export interface EmbeddingGenerator {
    model: string,
    embeddingDimension: number;
    generateEmbedding: (ctx: EmbeddingContext) => Promise<number[]>;
}

export interface EmbeddingGeneratorProvider extends Registerable {
    component: React.ComponentType,
    getValue: (data: FormData) => Record<string, any>,
    getGenerator: () => Promise<EmbeddingGenerator>;
}

export interface EmbeddingSettingState {
    embeddingGenerator: string;
    disabled: boolean;
    embeddingGeneratorConfig: Record<string, any>;
}

export const useEmbeddingSettingState = create<EmbeddingSettingState>()(
    persist<EmbeddingSettingState>(() => ({
            embeddingGenerator: "transformers",
            embeddingGeneratorConfig: {},
            disabled: false,
        }),
        {
            name: "rag_setting",
            storage: createJSONStorage(() => remoteStorage),
            partialize: (state) => ({
                disabled: state.disabled,
                embeddingGenerator: state.embeddingGenerator,
                embeddingGeneratorConfig: state.embeddingGeneratorConfig,
            }),
        }
    )
);

export interface RagModel<TSchema> {
    generator: EmbeddingGenerator,
    database: Orama<TSchema>,
}

export async function createDatabase<TSchema>(schema: TSchema): Promise<RagModel<TSchema> | null> {
    const manager = embeddingGeneratorManager;
    const state = useEmbeddingSettingState.getState();
    const provider =
        manager.records[state.embeddingGenerator];
    if (state.disabled || !provider) {
        return null;
    }
    const generator = await provider.getGenerator();
    return {
        generator,
        database: createSchema({
            schema: {
                ...schema,
                embedding: `vector[${generator.embeddingDimension}]`,
            },
            sort: {
                enabled: true,
            }
        }),
    };
}
