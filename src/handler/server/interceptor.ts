import {ServerRegistry, getInstance} from "@/plugins/server";
import {NextRequest, NextResponse} from "next/server";
import {registerServerPlugins} from "@/server-registerer";
import {InterceptorModels} from "./interceptor-models";

export type NextRouter = (request: NextRequest, records: Record<string, any>) => Promise<NextResponse>;
export type NextHandler = (request: NextRequest, context: any) => Promise<NextResponse>;

class Interceptor extends ServerRegistry<InterceptorModels> {

    constructor(name: string) {
        super(name);
    }

    createRoute(route: NextRouter): NextHandler {
        return async (request: NextRequest, context: any) => {
            await registerServerPlugins();
            const interceptors = this.getSorted();
            console.debug(`[${this.name}]: use ${interceptors.length} interceptors`);
            const handler = this.compose(interceptors, route);
            return handler(request, context);
        };
    }

    /**
     * 递归执行中间件
     * */
    compose(interceptors: InterceptorModels[], route: NextRouter): NextHandler {

        return async (request: NextRequest, context: any): Promise<NextResponse> => {
            const records: Record<string, any> = {
                context
            };

            const dispatch = async (index: number): Promise<NextResponse> => {
                if (index >= interceptors.length) {
                    console.debug(`[${this.name}] request from api `);
                    return await route(request, records);
                }

                const interceptor = interceptors[index];
                console.debug(`[${this.name}] use ${interceptor.id}`);
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