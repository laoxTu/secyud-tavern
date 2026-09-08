import { errorInterceptor } from './error';

import { manager } from '.';

export default async function () {
  manager.register(errorInterceptor);
}
