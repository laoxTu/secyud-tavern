import {describe, it, beforeEach} from 'vitest';
import {env, FeatureExtractionPipeline, pipeline} from "@huggingface/transformers";

import * as ort from 'onnxruntime-node';
env.remoteHost = 'https://hf-mirror.com';
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
// 关键：配置 ONNX Runtime 后端
env.backends.onnx = {
    // 强制使用 CPU
    executionProviders: ['cpu'],
    // 设置日志级别以便调试
    setLogLevel: (level: number) => {
        console.log('ONNX Log Level:', level);
    }
};
describe('Transformers', async () => {

    console.info('开始下载模型...')
    const extractor:FeatureExtractionPipeline = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2')
    console.info('模型加载完成')
    beforeEach(() => {
    });

    it('应当正确解析向量', async () => {
        const result = await extractor("你好，世界！", {
            pooling: 'mean',
            normalize: true,
        } );
        const data = result.tolist()[0];
        console.info(data);
    }, 60_000);
});