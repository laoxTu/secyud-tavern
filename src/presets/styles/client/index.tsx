import { PaletteIcon } from 'lucide-react';

import { styles as main } from '..';

import { Content } from './content';
import { renderer } from './realm';

export const styles = {
  ...main,
  renderer,
  tab: {
    preset: {
      id: main.name,
      hidable: true,
      icon: () => <PaletteIcon />,
      label: `style.id`,
      content: Content,
    },
  },
};
