import {describe, it, beforeEach} from 'vitest';
import {env, FeatureExtractionPipeline, pipeline} from "@huggingface/transformers";
import path from "path";
import {fileURLToPath} from "url";


describe('Transformers', async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const root = path.resolve(__dirname, '../..');
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.localModelPath = `${root}/public/models/`
    beforeEach(() => {
    });

    it('应当正确解析向量', async () => {
        console.info('开始下载模型...')
        const extractor:FeatureExtractionPipeline = await pipeline('feature-extraction', 'all-MiniLM-L6-v2')
        console.info('模型加载完成')
        const result = await extractor("你好，世界！", {
            pooling: 'mean',
            normalize: true,
        } );
        const data = result.tolist()[0];
        console.info(data);
    }, 60_000);
});