import {
    RagEmbeddingGeneratorProvider,
    useRagSettingState
} from "@/engines/rags/client/models";
import {Editor} from "./editor";
import {env, pipeline} from "@huggingface/transformers";

export interface TransformerModelInfo {
    dimension: number,
    model: string
}

export const transformerModels: Record<string, TransformerModelInfo> = {
    "all-MiniLM-L6-v2":
        {
            model: "all-MiniLM-L6-v2",
            dimension: 384,
        }
};

export const transformersEmbeddingGenerator: RagEmbeddingGeneratorProvider = {
    async getGenerator() {
        const state = useRagSettingState.getState();
        const config = state.embeddingGeneratorConfig;
        let model = config["model"];
        if (!model || model === '') {
            model = 'all-MiniLM-L6-v2';
        }
        env.allowLocalModels = true;
        env.localModelPath = '/models/';
        env.allowRemoteModels = false;
        // env.remoteHost = config["huggingface_mirror"] ?? 'https://huggingface.co';
        // console.debug("[transformer] remoteHost: ", env.remoteHost);
        const info = transformerModels[model];
        console.debug("[transformer]", info);
        const extractor = await pipeline("feature-extraction", info.model);
        return {
            embeddingDimension: info.dimension,
            async generateEmbedding(ctx) {
                const result = await extractor(ctx.content, {
                    pooling: 'mean',
                    normalize: true
                });
                return result.tolist()[0];
            }
        };
    },
    editor: Editor,
    getEditorValue(data: FormData): Record<string, any> {
        return {
            model: data.get("model") as string,
            huggingface_mirror: data.get("huggingface_mirror") as string,
        };
    },
    id: "transformers"
}