'use client';
import { callbacks } from '@/comfyui/callback/client';
import { civitais } from '@/comfyui/civitai/client';
import { configurators } from '@/comfyui/client/configurator';
import { feature } from '@/comfyui/client/feature';
import { menu } from '@/comfyui/client/menu';
import { proxy } from '@/comfyui/client/proxy';
import { setting } from '@/comfyui/client/setting';
import { editors } from '@/comfyui/editor/client';
import { selects } from '@/comfyui/select/client';
import { globals, settings } from '@/global/client';
import { stories } from '@/stories/client';

import { comfyuis as main } from '..';

import { importers } from './importers';

export * from './components';
export type * from './configurator';
export type * from './importers';
export * from './state';

export const comfyuis = {
  ...main,
  proxy,
  importers,
  configurators,
  setting,
  menu,
  feature,
};

export default async function () {
  comfyuis.importers.registry.register(civitais.importer);
  stories.features.registry.register(comfyuis.feature);
  settings.tabs.register(comfyuis.setting);
  globals.menus.register(comfyuis.menu);
  comfyuis.configurators.registry.register(
    callbacks.configurator,
    selects.configurator.select,
    selects.configurator.modelSelect,
    selects.configurator.powerLoraSelect,
    editors.configurator.text,
    editors.configurator.agentText,
    editors.configurator.number,
  );
}
