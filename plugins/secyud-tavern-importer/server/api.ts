import { CharacterCard, OpenAIPreset } from 'parsecard';

import { files } from '@/files/server';
import { BusinessError } from '@/interceptors';
import { route } from '@/interceptors/server';
import { Preset } from '@/presets';
import { presets } from '@/presets/server';
import { jsonUtils } from '@/utils';
import { response } from '@/utils/server';

import { sillyTaverns } from './silly-tavern';
import { forms } from '@/global';

export default {
  'silly-tavern': {
    import: {
      POST: route(async (request) => {
        const formData = await request.formData();
        const file = forms.file(formData,'file') ;
        let preset: Preset | null = null;

        if (!file) {
          throw new BusinessError('No file uploaded', 'error.file_invalid');
        }

        /**
         * json 文件
         */
        if (file.type.startsWith('application/json')) {
          const text = await file.text();
          const json = jsonUtils.parse(text);
          if (json.spec) {
            const card = CharacterCard.fromJSON(json);
            preset = await sillyTaverns.chara(card);
          } else {
            const entry = OpenAIPreset.fromJSON(json);
            preset = await sillyTaverns.preset(entry);
          }
        }
        /**
         * 图片
         */
        else {
          const buffer = await file.arrayBuffer();

          const card = CharacterCard.fromPNG(buffer);
          if (!card) {
            throw new BusinessError(
              'file is invalid',
              'error.silly_tavern.file_invalid',
            );
          }

          const cover = await files.repository.create({
            type: 'image/png',
            args: null,
            buffer: Buffer.from(buffer),
          });

          preset = await sillyTaverns.chara(card, cover);
        }

        if (!preset) {
          throw new BusinessError('invalid preset');
        }

        const id = await presets.repository.create(preset);
        return response.json({ id });
      }),
    },
  },
};
