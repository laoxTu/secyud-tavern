import { NextRequest, NextResponse } from 'next/server';

import { BusinessError } from '..';

import { InterceptorHandler, NextRecord } from '.';

export const errorInterceptor: InterceptorHandler = {
  id: 'error',
  async handle(
    request: NextRequest,
    _: NextRecord,
    next: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    try {
      return await next();
    } catch (error) {
      if (error instanceof BusinessError) {
        if (request.method !== 'GET') console.error(error);
        return NextResponse.json(
          {
            message: error.message,
            code: error.code,
            data: error.data,
          },
          { status: error.status ?? 500 },
        );
      }

      if (error instanceof Error) {
        console.error(error);
        return NextResponse.json(
          {
            message: error.message,
            data: {},
          },
          { status: 500 },
        );
      }

      throw error;
    }
  },
};
