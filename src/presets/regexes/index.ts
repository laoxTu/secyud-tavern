export interface Regex {
  pattern: string;
  replacement: string;
  target: string;
}
const defaultEntry: Regex = {
  target: 'input',
  replacement: '',
  pattern: '',
};
export const regexes = {
  name: 'regex',
  plural: 'regexes',
  default: defaultEntry,
};
