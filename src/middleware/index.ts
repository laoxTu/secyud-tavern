// src/middleware/index.ts
import {NextFetchEvent, NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/src/model/registerable";

export interface Middleware extends Registerable {
    handle: (
        request: NextRequest,
        event: NextFetchEvent,
        response: NextResponse
    ) => NextResponse | Promise<NextResponse>;
}

export { default as middleware } from "./manager";