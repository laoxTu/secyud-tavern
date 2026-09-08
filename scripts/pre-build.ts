import path from 'path';
import { fileURLToPath } from 'url';

import { generateEnvFile } from './operations/env';
import { analyzeManifests } from './operations/manifest';
import { migrate } from './operations/migrate';
import { downloadModels } from './operations/models';

import { fileUtils } from '@/utils/server/file';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

await run();

async function run() {
  await fileUtils.copy(
    path.join(root, 'src/app/favicon.svg'),
    path.join(root, 'public/favicon.svg'),
  );

  await migrate(root);
  await generateEnvFile(root);
  await downloadModels(root);
  await analyzeManifests(root);

  const api = await import('./operations/api');
  await api.default(root);
}
