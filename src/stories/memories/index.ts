export interface Memory {
  text: string;
  sequence: number;
  importance: number;
  type: string;
  tags: string[];
}

const defaultValue: Memory = {
  text: '',
  sequence: 100,
  importance: 5,
  type: 'event',
  tags: [],
};

export const memories = {
  default: defaultValue,
  types: ['event', 'relation', 'knowledge', 'other'],
  name: 'memory',
  plural: 'memories',
};
