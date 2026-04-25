import {Interceptor} from "@/interceptor";
import {NextRequest, NextResponse} from "next/server";

class ErrorInterceptor implements Interceptor {
    id: string = "error interceptor";

    async handle(request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>): Promise<NextResponse> {
        try {
            return await next();
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                {message: error instanceof Error ? error.message : 'Internal Server Error'},
                {status: 500}
            );
        }
    }
}


export const errorInterceptor = new ErrorInterceptor();