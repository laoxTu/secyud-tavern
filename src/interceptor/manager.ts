// src/interceptor/manager.ts
import {Registry} from "@/models/registerable";
import {NextRequest, NextResponse} from "next/server";
import {Interceptor} from ".";

type NextRouter = (request: NextRequest, records: Record<string, any>) => Promise<NextResponse>;
type NextHandler = (request: NextRequest, context: any) => Promise<NextResponse>;

class InterceptorManager extends Registry<Interceptor> {
    createRoute(route: NextRouter): NextHandler {
        const interceptors = this.getSorted();
        return this.compose(interceptors, route);
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
                    return await route(request, records);
                }

                const interceptor = interceptors[index];
                const next = () => dispatch(index + 1);
                return interceptor.handle(request, records, next);
            };
            return dispatch(0);
        };
    }
}

const manager = new InterceptorManager("middleware manager");
export default manager;
