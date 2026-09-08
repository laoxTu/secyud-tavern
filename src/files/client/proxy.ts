import { validate } from 'uuid';

import { del, get, post } from '@/client';
import { DataRequest, DataResponse } from '@/database';
import { FileModel, FileRequestParam } from '@/files';

export const proxy = {
  async delete(id: string) {
    await del('files/{id}', {
      params: { id },
    });
  },
  async create(file: File): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return await post('files', formData);
  },
  async list(
    request?: DataRequest<FileRequestParam>,
  ): Promise<DataResponse<FileModel>> {
    return await get('files', {
      params: request,
    });
  },
  url(id?: string | null) {
    if (!id) return '';

    if (validate(id)) {
      return `/api/files/resource/${id}`;
    }
    try {
      new URL(id);
      return id;
    } catch {
      return '';
    }
  },
};
