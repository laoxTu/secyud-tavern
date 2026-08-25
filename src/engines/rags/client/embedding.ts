import {EmbeddingGeneratorProvider} from "@/engines/rags/client/models";
import {ClientRegistry} from "@/plugins/client";


export const embeddingGeneratorManager = new ClientRegistry<EmbeddingGeneratorProvider>("ragEmbeddingGeneratorManager");