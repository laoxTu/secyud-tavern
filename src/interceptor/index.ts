// src/interceptor/index.ts

import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/models/registerable";
import interceptor from "./manager";

export interface Interceptor extends Registerable {
    handle: (request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>) => Promise<NextResponse>;
}

export {interceptor};