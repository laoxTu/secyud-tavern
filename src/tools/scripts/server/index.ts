import { ToolProvider } from '@/tools/server';
import { archive } from '@/utils/archive';

import { scripts as main, ScriptConfig } from '..';

const provider: ToolProvider<ScriptConfig> = {
  async loadArchive(item, name) {
    const res = [
      archive.text(`${name}.desc.txt`, item.config.description),
      archive.text(`${name}.schema.json`, item.config.schema),
      archive.text(`${name}.script.js`, item.config.script),
    ];

    item.config.description = undefined!;
    item.config.schema = undefined!;

    return res;
  },
  async saveArchive(nodes, item, name) {
    item.config.description = archive.get(nodes, `${name}.desc.txt`);
    item.config.schema = archive.get(nodes, `${name}.schema.json`);
    item.config.script = archive.get(nodes, `${name}.script.js`);
  },
  id: main.name,
};

export const scripts = {
  ...main,
  provider,
};
