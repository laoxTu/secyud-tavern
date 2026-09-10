import { validate } from 'uuid';

import { Entity } from '@/database';

export interface FileModel extends Entity {
  type: string;
  args: string | null;
}

export interface FileRequestParam {
  type?: string;
}

export const files = {
  name: 'file',
  outer(id?: string | null) {
    try {
      new URL(id!);
      return true;
    } catch (err) {
      return false;
    }
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
  deserializeMimeType(mimeType: string): { type: string; args: string | null } {
    const trimmed = mimeType?.trim();
    if (!mimeType) return { type: '', args: null };
    const [type, ...rest] = trimmed.split(';').map((s) => s.trim());
    const args = rest.filter(Boolean).join('; ') || null;

    return { type: type || '', args };
  },
  serializeMimeType({
    type,
    args,
  }: {
    type: string;
    args: string | null;
  }): string {
    return `${type}; ${args}`;
  },
};
