import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/utils/register";

export interface NextContext {
    params: Record<string, any>,
}

export interface NextRecord extends NextContext{
    searchParams: Record<string, any>,
}

export interface InterceptorModels extends Registerable {
    handle: (request: NextRequest, records: NextRecord, next: () => Promise<NextResponse>) => Promise<NextResponse>;
}
