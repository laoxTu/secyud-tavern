import path from 'path';

import { getRegistry, Manifest, Registerable } from '@/plugins';
import { jsonUtils } from '@/utils';
import { fileUtils } from '@/utils/server/file';

const pad = '    ';

// 插件描述符
interface ManifestDescriptor extends Registerable {
  manifest: Manifest;
  alias: string;
  folder: string;
  dir: string;
}

async function getManifests(dir: string, alias: string) {
  // 检查插件目录是否存在
  if (!(await fileUtils.exists(dir))) {
    console.warn(`[manifest]: folder not found. (${dir})`);
    return [];
  }

  // 读取目标目录下的所有文件夹
  const entries = await fileUtils.listDirs<string>(dir, (u) => u.name);
  // 准备返回的描述符
  const descriptors: ManifestDescriptor[] = [];
  for (const folder of entries) {
    const subDir = path.join(dir, folder);
    const manifestPath = path.join(subDir, 'manifest.json');
    if (!(await fileUtils.exists(manifestPath))) continue;

    const text = await fileUtils.fs.readFile(manifestPath, 'utf-8');
    const manifest = jsonUtils.parse(text) as Manifest;
    if (!manifest || manifest.disabled) continue;

    descriptors.push({
      id: manifest.id,
      sequence: manifest.sequence,
      requires: manifest.requires,
      manifest,
      folder,
      alias,
      dir: subDir,
    });

    console.info(`[manifest]: find ${folder}`);
  }
  return descriptors;
}

/**
 * 构造导入-使用形式的文件
 * @param modules 模块元素
 * @param build 包裹符号
 * @param text 行符号
 */
function buildModuleImport(
  modules: string[],
  build: (text: string) => string,
  text: (text: string, module: string) => string,
) {
  return `${modules.map((u, i) => `import r${i} from '${u}'`).join('\n')}\n\n${build(
    modules.map((m, i) => text(`r${i}`, m)).join('\n'),
  )}`;
}

/**
 * 生成本地化资源的集合
 * @param root
 * @param descriptors
 */
async function generateLocalizationResource(
  root: string,
  descriptors: ManifestDescriptor[],
) {
  // 注册语言
  const resources: Record<string, string[]> = {};
  for (const descriptor of descriptors) {
    const dir = path.join(descriptor.dir, 'localization');
    const { alias, folder } = descriptor;
    if (!(await fileUtils.exists(dir))) continue;
    const entries = (await fileUtils.listFiles(dir, (u) => u.name)).filter(
      (u) => u.endsWith('.json'),
    );
    for (const entry of entries) {
      const lang = entry.substring(0, entry.length - 5);
      const file = `${alias}/${folder}/localization/${entry}`;
      let resource = resources[lang];
      if (!resource) {
        resource = [];
        resources[lang] = resource;
      }
      resource.push(file);
    }
  }

  const texts: string[] = [
    'export const resources : Record<string, () => Promise<any[]>> = {',
  ];
  for (const lang of Object.keys(resources)) {
    const resource = resources[lang];
    texts.push(`${pad}${lang}: async () => {\n${pad}${pad}return [`);
    for (const file of resource) {
      texts.push(`${pad}${pad}${pad}await import('${file}'),`);
    }
    texts.push(`${pad}${pad}];\n${pad}},`);
  }
  texts.push(`}`);

  await fileUtils.writeFile(
    path.join(root, 'src', 'localization', 'resources.ts'),
    texts.join('\n'),
  );
}

/**
 * 生成路由注册文件
 * @param root
 * @param descriptors
 */
async function generateApi(root: string, descriptors: ManifestDescriptor[]) {
  const files: string[] = [];
  for (const { dir, folder, alias } of descriptors) {
    if (await fileUtils.exists(path.join(dir, 'server/api.ts'))) {
      files.push(`${alias}/${folder}/server/api`);
    }
  }

  // 注册路由
  await fileUtils.writeFile(
    path.join(root, 'scripts', 'generated', 'route.ts'),
    buildModuleImport(
      files,
      (t) => `export const items = [\n${t}\n]`,
      (t, u) => `${pad}{ item: ${t}, module: '${u}' },`,
    ),
  );
}

/**
 * 生成服务端注册表
 * @param root
 * @param descriptors
 */
async function generateServerRegisterer(
  root: string,
  descriptors: ManifestDescriptor[],
) {
  const files: string[] = [];
  for (const { folder, alias, manifest } of descriptors) {
    if (manifest.server) {
      files.push(`${alias}/${folder}/${manifest.server}`);
    }
  }

  // 服务端注册
  await fileUtils.writeFile(
    path.join(root, 'src', 'plugins', 'server', 'registerer.ts'),
    buildModuleImport(
      files,
      (t) => `export async function registerServerPlugin() {\n${t}\n}`,
      (t, a) => `${pad}console.debug('${a}');\n${pad}await ${t}();`,
    ),
  );
}

/**
 * 生成客户端注册表
 * @param root
 * @param descriptors
 */
async function generateClientRegisterer(
  root: string,
  descriptors: ManifestDescriptor[],
) {
  const files: string[] = [];
  for (const { folder, alias, manifest } of descriptors) {
    if (manifest.client) {
      files.push(`${alias}/${folder}/${manifest.client}`);
    }
  }

  // 服务端注册
  await fileUtils.writeFile(
    path.join(root, 'src', 'plugins', 'client', 'registerer.ts'),
    buildModuleImport(
      files,
      (t) => `export async function registerClientPlugin() {\n${t}\n}`,
      (t, a) => `${pad}console.debug('${a}');\n${pad}await ${t}();`,
    ),
  );
}

/**
 * 分析manifest文件，生成注册表
 * @param root
 */
export async function analyzeManifests(root: string) {
  const manager = getRegistry<ManifestDescriptor>('manifest');
  manager.register(
    ...(await getManifests(path.join(root, 'src'), '@')),
    ...(await getManifests(path.join(root, 'plugins'), '@plugins')),
  );
  const descriptors = manager.sorted();

  await generateLocalizationResource(root, descriptors);
  await generateApi(root, descriptors);
  await generateServerRegisterer(root, descriptors);
  await generateClientRegisterer(root, descriptors);
}
