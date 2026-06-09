import {NextResponse} from "next/server";
import {ConditionFunc, Repository} from "@/business/server/repository";
import {NextHandler} from "@/handler/server/interceptor";
import {BusinessError} from "@/handler/models";
import {BaseModel, PageOptions} from "@/business/models";

export function generateGetModelListApi<TModel>(repository: Repository<TModel>, conditionGenerator?: (search: any) => ConditionFunc): NextHandler {
    return async (request, records) => {
        const options = records.searchParams as PageOptions;
        const models =
            await repository.getList(options, conditionGenerator?.(options.search));
        return NextResponse.json(models);
    }
}

export function generateGetModelApi<TModel>(
    repository: Repository<TModel>, conditionGenerator?: (id: string) => ConditionFunc): NextHandler {
    return async (request, records) => {
        const {id} = await records.context.params;
        const {withDetails} = records.searchParams as { withDetails?: boolean };
        const model = await repository.get(id, withDetails, conditionGenerator?.(id));
        return NextResponse.json(model);
    }
}

export function generateCreateModelApi<TModel extends BaseModel>(
    repository: Repository<TModel>,
    checkAction?: (model: TModel, params: {
        isImport?: boolean
    }) => Promise<void>): NextHandler {
    return async (request, records) => {
        const model = records.body as TModel;

        checkAction?.(model, records.searchParams);

        if (model.name === "") {
            throw new BusinessError("No name provided", "error.empty_field")
                .withValue("field", "default.name");
        }

        if (records.searchParams.isImport) {
            model.id = "";
        }

        const id = await repository.create(model);

        return NextResponse.json({id});
    }
}

export function generateUpdateModelApi<TModel extends BaseModel>(
    repository: Repository<TModel>,
    checkAction?: (model: Partial<TModel>, params: {
        isImport?: boolean
    }) => Promise<void>): NextHandler {
    return async (request, records) => {
        const {id} = await records.context.params;
        const model = records.body as Partial<TModel>;
        checkAction?.(model, records.searchParams);
        await repository.update(id, model);
        return NextResponse.json(null);
    }
}

export function generateDeleteModelApi<TModel extends BaseModel>(
    repository: Repository<TModel>): NextHandler {
    return async (request, records) => {
        const {id} = await records.context.params;
        await repository.delete(id);
        return NextResponse.json(null);
    }
}

export function generateExportModelApi<TModel>(
    repository: Repository<TModel>,
    fileNameAccessor: (model: TModel) => string,
    conditionGenerator?: (id: string) => ConditionFunc,
    settings?: (model: TModel) => void): NextHandler {
    return async (request, records) => {
        const {id} = await records.context.params;
        const {withDetails} = records.searchParams as { withDetails?: boolean };
        const model = await repository.get(id, withDetails, conditionGenerator?.(id));
        if (model === null) throw new Error('not found');
        settings?.(model);
        // 1. 将 JSON 对象转为字符串
        const jsonStr = JSON.stringify(model);

        // 2. 创建 Web 标准的 ReadableStream（不是 Node.js 的 stream.ReadableStream）
        const encoder = new TextEncoder();
        const jsonStream = new ReadableStream({
            start(controller) {
                // 将 JSON 字符串编码为 Uint8Array 并加入流
                controller.enqueue(encoder.encode(jsonStr));
                controller.close();  // 关闭流
            }
        });

        // 3. 设置响应头，触发下载
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${fileNameAccessor(model)}.json"`);

        return new NextResponse(jsonStream, {status: 200, headers});
    }
}


export function generateGetEntryListApi<TModel>(repository: Repository<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType} = await records.context.params as { id: string, entryType: string };
        const options = records.searchParams as PageOptions;
        const models = await repository.entry.getList(id, entryType, options);
        return NextResponse.json(models);
    }
}

export function generateCreateEntryApi<TModel>(repository: Repository<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType} = await records.context.params as { id: string, entryType: string };
        const model = records.body;
        const entryId = await repository.entry.create(id, entryType, model);
        return NextResponse.json({id: entryId});
    }
}

export function generateUpdateEntryApi<TModel>(repository: Repository<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const model = records.body;
        await repository.entry.update(id, entryType, entryId, model);
        return NextResponse.json(null);
    }
}

export function generateDeleteEntryApi<TModel>(repository: Repository<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        await repository.entry.delete(id, entryType, entryId);
        return NextResponse.json(null);
    }
}

export function generateSetDisableEntryApi<TModel>(repository: Repository<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const {disabled} = await records.searchParams as { disabled: boolean };
        await repository.entry.setDisabled(id, entryType, entryId, disabled);
        return NextResponse.json(null);
    }
}