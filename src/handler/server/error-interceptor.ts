import {NextRequest, NextResponse} from "next/server";
import {BusinessError} from "../models";
import {InterceptorModels} from "./interceptor-models";

class ErrorInterceptor implements InterceptorModels {
    id: string = "errors interceptor";

    async handle(request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>): Promise<NextResponse> {
        try {
            return await next();
        } catch (error) {

            if (error instanceof BusinessError) {
                console.error(error);
                return NextResponse.json(
                    {
                        message: error.message,
                        code: error.code,
                        data: error.data,
                    },
                    {status: 500}
                );
            }

            if (error instanceof Error) {
                console.error(error);
                return NextResponse.json(
                    {
                        message: error.message,
                        data: {}
                    },
                    {status: 500}
                );
            }

            throw error;
        }
    }
}


export const errorInterceptor = new ErrorInterceptor();