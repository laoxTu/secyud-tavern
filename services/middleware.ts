// services/middleware.ts
import {NextRequest, NextResponse} from "next/server";

export type NextHandler = (request: NextRequest) => Promise<NextResponse>;
export type MiddlewareFunction = (
    request: NextRequest,
    next: NextHandler
) => Promise<NextResponse>;

const middlewares: MiddlewareFunction[] = [];

export function use(middleware: MiddlewareFunction) {
    middlewares.push(middleware);
    return {use, createHandler: requestHandler};
}

/**
 * 递归执行中间件
 * */
function compose(middlewares: MiddlewareFunction[]): NextHandler {
    return async (request: NextRequest): Promise<NextResponse> => {
        const dispatch = async (index: number): Promise<NextResponse> => {
            if (index >= middlewares.length) {
                throw new Error('No route handler found');
            }

            const middleware = middlewares[index];

            const next = () => dispatch(index + 1);

            return await middleware(request, next);
        };

        return dispatch(0);
    };
}

export function requestHandler<T>(
    handler: (request: NextRequest) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T>> {
    if (middlewares.length === 0) {
        return handler;
    }

    const allMiddlewares: MiddlewareFunction[] = [...middlewares,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async (req: NextRequest, next: NextHandler) => {
            return await handler(req);
        }];

    return compose(allMiddlewares) as any;
}