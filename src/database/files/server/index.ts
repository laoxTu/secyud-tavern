import { FileModel, files as main } from '..';

import { repository } from './repository';

export interface FileModelWithBuffer extends FileModel {
  buffer: Buffer;
}

export const files = {
  ...main,
  repository,
};
