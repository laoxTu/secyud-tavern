// src/interceptor/manager.ts
import {ServerRegistry} from "../plugins";
import {NextRequest, NextResponse} from "next/server";
import {Interceptor} from "./index";
import {registerServerPlugins} from "@/server/initialize";

type NextRouter = (request: NextRequest, records: Record<string, any>) => Promise<NextResponse>;
type NextHandler = (request: NextRequest, context: any) => Promise<NextResponse>;

export class InterceptorManager extends ServerRegistry<Interceptor> {
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
    compose(interceptors: Interceptor[], route: NextRouter): NextHandler {

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
}


