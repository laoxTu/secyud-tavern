import {NextRequest, NextResponse} from 'next/server';
import {PresetModel} from "@/src/business/preset/models";
import {repository} from "@/src/business/preset/repository";


/**
 * 导入预设
 * @body PresetModel
 * @response {id: string}
 * @openapi
 */
export async function POST(request: NextRequest) {
    const model = await request.json() as PresetModel;
    const res = await repository.create(model);
    return NextResponse.json(res);
}