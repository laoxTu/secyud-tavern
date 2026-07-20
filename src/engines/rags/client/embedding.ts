import {RagEmbeddingGeneratorProvider} from "@/engines/rags/client/models";
import {ClientRegistry} from "@/plugins/client";


export const embeddingGeneratorManager = new ClientRegistry<RagEmbeddingGeneratorProvider>("ragEmbeddingGeneratorManager");