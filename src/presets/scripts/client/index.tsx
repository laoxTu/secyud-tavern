import { Code2Icon } from 'lucide-react';

import { scripts as main } from '..';

import { Content } from './content';
import { renderer } from './realm';

export const scripts = {
  ...main,
  renderer,
  tab: {
    preset: {
      id: main.name,
      hidable: true,
      icon: () => <Code2Icon />,
      label: `script.id`,
      content: Content,
    },
  },
};
