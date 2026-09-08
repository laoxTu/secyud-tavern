export interface Style {
  code: string;
  content: string;
  priority: number;
  type: string;
}
const defaultEntry: Style = {
  code: '',
  content: '',
  priority: 100,
  type: 'text/css',
};
export const styles = {
  name: 'style',
  plural: 'styles',
  default: defaultEntry,
};
