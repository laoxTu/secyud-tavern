import path from 'path';

import { fileUtils } from '@/utils/server/file';

/**
 * 下载到public/models下
 * @param param0
 * @param param0.root 根路径
 * @param param0.repository 需要下载的仓库
 * @param param0.local 本地子目录
 * @param param0.files 需要下载的文件
 */
async function huggingFace({
  root,
  repository,
  local,
  files,
}: {
  root: string;
  repository: string;
  local: string;
  files: string[];
}) {
  const config = await import('../build-config.json');
  for (const file of files) {
    await fileUtils.download(
      `${config.mirrors.huggingface}/${repository}/resolve/main/${file}`,
      path.join(root, 'public/models', `${local}/${file}`),
    );
  }
}

/**
 * 下载需要的模型
 * @param root
 */
export async function downloadModels(root: string) {
  // region 下载embedding 向量生成模型
  const embeddingModelFiles = [
    'config.json',
    // "onnx/model.onnx", // wasm 不需要这个
    'tokenizer_config.json',
    'tokenizer.json',
    'onnx/model_quantized.onnx',
  ];
  await huggingFace({
    root,
    local: 'all-MiniLM-L6-v2',
    repository: 'Xenova/all-MiniLM-L6-v2',
    files: embeddingModelFiles,
  });
  await huggingFace({
    root,
    local: 'bge-small-zh-v1.5',
    repository: 'Xenova/bge-small-zh-v1.5',
    files: embeddingModelFiles,
  });
  // endregion
}
