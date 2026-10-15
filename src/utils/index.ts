export { arrUtils } from './array';
export { jsonUtils } from './json';
export * from './json-patch';
export * from './json-schema';
export { strUtils } from './str';

type Action = () => Promise<void>;
type Middleware = (next: Action) => Promise<void>;

export function invokeCompose(
  actions: Middleware[],
  last: Action,
): Promise<void> {
  async function invoke(index: number): Promise<void> {
    if (index >= actions.length) {
      return last();
    }

    let called = false;

    return actions[index](() => {
      if (called) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      called = true;
      return invoke(index + 1);
    });
  }

  return invoke(0);
}
