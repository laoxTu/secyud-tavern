import {NextRequest, NextResponse} from "next/server";
import {Registerable} from "@/utils/register";

export interface InterceptorModels extends Registerable {
    handle: (request: NextRequest, records: Record<string, any>, next: () => Promise<NextResponse>) => Promise<NextResponse>;
}
