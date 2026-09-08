import React from 'react';

import { getRegistry, Registerable } from '@/plugins';

export interface Feature extends Registerable {
  component: React.ComponentType;
}

const registry = getRegistry<Feature>('realm-feature');

export const features = {
  registry,
};
