// src/interceptor/index.ts

import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/src/models/registerable";

export interface Interceptor extends Registerable {
    handle: (request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>) => Promise<NextResponse>;
}

export {default as interceptor} from "./manager";