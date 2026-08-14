import {ServerRegistry, getInstance} from "@/plugins/server";
import {NextRequest, NextResponse} from "next/server";
import {registerServerPlugins} from "@/server-registerer";
import {InterceptorModels, NextContext, NextRecord} from "./interceptor-models";

// 用户的输入方法
export type NextHandler = (request: NextRequest, records: NextRecord) => Promise<NextResponse>;
// 拦截器生成的路由
type NextHandlerResult = (request: NextRequest, context: NextContext) => Promise<NextResponse>;


/**
 * 从 URLSearchParams 反序列化为对象
 * 默认的searchParams 无法支持复杂对象
 * 和 client.ts 中 buildUrl 方法对应
 */
function deserializeSearchParams(searchParams: URLSearchParams) {
    const raw = Object.fromEntries(searchParams);
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(raw)) {
        if (value === '' || value === undefined) continue;

        try {
            result[key] = JSON.parse(value);
        } catch {
            result[key] = value;
        }
    }

    return result;
}

class Interceptor extends ServerRegistry<InterceptorModels> {

    constructor(name: string) {
        super(name);
    }

    createRoute(route: NextHandler): NextHandlerResult {
        return async (request: NextRequest, context: NextContext) => {
            await registerServerPlugins();
            const interceptors = this.getSorted();
            const handler = this.compose(interceptors, route);
            return handler(request, context);
        };
    }

    /**
     * 递归执行中间件
     * */
    compose(interceptors: InterceptorModels[], route: NextHandler): NextHandlerResult {

        return async (request, context) => {
            const records: NextRecord = {
                ...context,
                searchParams: deserializeSearchParams(request.nextUrl.searchParams),
            };

            const dispatch = async (index: number): Promise<NextResponse> => {
                if (index >= interceptors.length) {
                    return await route(request, records);
                }
                const interceptor = interceptors[index];
                console.debug(`[${this.name}] intercepted by ${interceptor.id}`);
                const next = () => dispatch(index + 1);
                return interceptor.handle(request, records, next);
            };
            return dispatch(0);
        };
    }

    static getInstance() {
        return getInstance("interceptors", (u) => new Interceptor(u));
    }
}

export const interceptor = Interceptor.getInstance();