import {RagEmbeddingGeneratorProvider} from "@/engines/rags/client/models";
import {ClientRegistry} from "@/plugins/client";
import {transformersEmbeddingGenerator} from "@/engines/rags/embedding/transformers/client";


export const embeddingGeneratorManager = new ClientRegistry<RagEmbeddingGeneratorProvider>("ragEmbeddingGeneratorManager",
    transformersEmbeddingGenerator);