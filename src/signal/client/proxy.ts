import { post } from '@/client';

import { SseSubscriptionAction } from '..';

import { useSseConnection } from './hook';

export const proxy = {
  async subscription(param: SseSubscriptionAction) {
    await post('sse/{id}/subscription', param, {
      params: {
        id: useSseConnection.getState().id,
      },
    });
  },
};
