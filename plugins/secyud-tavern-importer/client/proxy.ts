import { post } from '@/client';

export const proxy = {
  async import(file: File) {
    const data = new FormData();
    data.append('file', file);
    await post('silly-tavern/import', data);
  },
};
