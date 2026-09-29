import { post } from '@/client';

import { SseSubscriptionAction } from '..';

export const proxy = {
  async subscription(param: SseSubscriptionAction) {
    await post('sse/{id}/subscription', param);
  },
};
