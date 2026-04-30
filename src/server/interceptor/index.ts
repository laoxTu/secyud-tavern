// src/server/interceptor/index.ts
import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/shared/register";
import {InterceptorManager} from "./manager";
import {errorInterceptor} from "../errors/error-interceptor";
import {paramInterceptor} from "./param-interceptor";

export interface Interceptor extends Registerable {
    handle: (request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>) => Promise<NextResponse>;
}

export const interceptor = new InterceptorManager("interceptor manager");

export function registerInterceptors() {
    interceptor.register(
        errorInterceptor,
        paramInterceptor
    );
}