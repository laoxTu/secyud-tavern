// src/interceptor/index.ts

import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/src/model/registerable";

export type NextHandler = (request: NextRequest) => Promise<NextResponse>;

export interface Interceptor extends Registerable {
    handle: (
        request: NextRequest,
        next: NextHandler
    ) => Promise<NextResponse>;
}

export {default as interceptor} from "./manager";