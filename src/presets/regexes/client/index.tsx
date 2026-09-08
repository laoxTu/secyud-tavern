import { ReplaceIcon } from 'lucide-react';

import { regexes as main } from '..';

import { Content } from './content';
import { processer, renderer } from './realm';

export const regexes = {
  ...main,
  renderer,
  processer,
  tab: {
    preset: {
      id: main.name,
      hidable: true,
      icon: () => <ReplaceIcon />,
      label: `regex.id`,
      content: Content,
    },
  },
};
