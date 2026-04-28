// src/interceptor/index.ts

import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/models/registerable";
import {InterceptorManager} from "./manager";
import {errorInterceptor} from "@/utils/error-interceptor";
import {paramInterceptor} from "@/utils/param-interceptor";

export interface Interceptor extends Registerable {
    handle: (request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>) => Promise<NextResponse>;
}

const interceptor = new InterceptorManager("interceptor manager");
interceptor.register(
    errorInterceptor,
    paramInterceptor
);

export {interceptor};