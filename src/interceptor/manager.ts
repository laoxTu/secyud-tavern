// src/interceptor/manager.ts
import {Registry} from "@/src/model/registerable";
import {NextRequest, NextResponse} from "next/server";
import {Interceptor, NextHandler} from ".";

class InterceptorManager extends Registry<Interceptor> {
    createRoute(route: NextHandler): NextHandler {
        const interceptors = this.getSorted();
        return this.compose(interceptors, route);
    }

    /**
     * 递归执行中间件
     * */
    compose(interceptors: Interceptor[], route: NextHandler): NextHandler {
        return async (request: NextRequest): Promise<NextResponse> => {
            const dispatch = async (index: number): Promise<NextResponse> => {
                if (index >= interceptors.length) {
                    return await route(request);
                }

                const interceptor = interceptors[index];
                const next = () => dispatch(index + 1);
                return await interceptor.handle(request, next);
            };

            return dispatch(0);
        };
    }
}

const manager = new InterceptorManager("middleware manager");
export default manager;
