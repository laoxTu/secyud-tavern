import path from 'path';

import { fileUtils } from '@/utils/server/file';

import { items as apiEntries } from '../generated/route';

const methods = new Set(['POST', 'PUT', 'DELETE', 'GET']);

interface ApiDescriptor {
  module: string;
  method: string;
  path: string;
}

async function getApiDescriptors() {
  const descriptors: ApiDescriptor[] = [];
  for (const entry of apiEntries) {
    for (const descriptor of await getApiDescriptorsFromEntry(entry)) {
      descriptors.push(descriptor);
    }
  }
  return descriptors;
}

async function getApiDescriptorsFromEntry({
  item,
  module,
}: {
  item: any;
  module: string;
}) {
  const descriptors: ApiDescriptor[] = [];
  for (const key of Object.keys(item)) {
    await getApiDescriptorsFromItem(item[key], key);
  }
  return descriptors;

  async function getApiDescriptorsFromItem(item: any, parent: string) {
    for (const key of Object.keys(item)) {
      if (methods.has(key)) {
        descriptors.push({
          method: key,
          module,
          path: parent,
        });
      } else {
        await getApiDescriptorsFromItem(item[key], `${parent}/${key}`);
      }
    }
  }
}

async function generateApiRoutes(root: string, descriptors: ApiDescriptor[]) {
  await fileUtils.fs.rm(path.join(root, 'src/app/api'), {
    recursive: true,
    force: true,
  });

  const files = Object.groupBy(descriptors, (u) => u.path);

  for (const dir of Object.keys(files)) {
    const items = files[dir]!;
    const file = path.join(root, 'src/app/api', dir, 'route.ts');
    const modules = Object.fromEntries(
      [...new Set(items.map((u) => u.module))].map((u, i) => [u, i]),
    );
    await fileUtils.writeFile(
      file,
      Object.entries(modules)
        .map((m) => `import api${m[1]} from '${m[0]}';\n`)
        .join('') +
        items
          .map((u) => {
            const i = modules[u.module];
            const get = u.path
              .split('/')
              .map((p) => `['${p}']`)
              .join('');
            return `\nexport const ${u.method} = api${i}${get}['${u.method}'];`;
          })
          .join(''),
    );
  }
}

async function generateApiKeys(root: string, descriptors: ApiDescriptor[]) {
  for (const descriptor of descriptors) {
    descriptor.path = descriptor.path.replaceAll('[', '{').replaceAll(']', '}');
  }

  const apiPathsRecord = Object.groupBy(descriptors, (u) => u.method);

  await fileUtils.writeFile(
    path.join(root, 'src', 'generated', 'api-path.ts'),
    `// api path
const get = [
${apiPathsRecord['GET']?.map((u) => `    '${u.path}',`).join('\n')}
] as const;
const post = [
${apiPathsRecord['POST']?.map((u) => `    '${u.path}',`).join('\n')}
] as const;
const put = [
${apiPathsRecord['PUT']?.map((u) => `    '${u.path}',`).join('\n')}
] as const;
const del = [
${apiPathsRecord['DELETE']?.map((u) => `    '${u.path}',`).join('\n')}
] as const;
export type GetPath = typeof get[number];
export type PostPath = typeof post[number];
export type PutPath = typeof put[number];
export type DelPath = typeof del[number];`,
  );
}

export default async function buildApi(root: string) {
  const descriptors = await getApiDescriptors();
  await generateApiRoutes(root, descriptors);
  await generateApiKeys(root, descriptors);
}
