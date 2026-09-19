import { files } from '@/files/server';
import { forms } from '@/global';
import { route } from '@/interceptors/server';
import { StoryEntry } from '@/stories';
import { stories } from '@/stories/server';
import { response } from '@/utils/server';

import { images, StoryImage } from '..';

// stories/[id]/image
export const image = {
  POST: route(async (request, record) => {
    const data = await request.formData();
    const { id } = await record.params;
    const image = forms.file(data, 'image');
    const mime = files.deserializeMimeType(image.type);
    const fileId = await files.repository.create({
      ...mime,
      buffer: Buffer.from(await image.arrayBuffer()),
    });

    const entry: StoryEntry<StoryImage> = {
      data: {
        image: fileId,
        updateAt: Date(),
      },
      masterId: id,
      entryType: images.name,
      entryId: 0,
      name: forms.str(data, 'name'),
    };
    await stories.repository.entry.add(id, images.name, entry);
    return response.json({ success: true });
  }),
};
