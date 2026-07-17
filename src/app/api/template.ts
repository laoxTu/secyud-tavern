import {NextResponse} from "next/server";
import {ConditionFunc, Repository} from "@/business/server/repository";
import {NextHandler} from "@/handler/server/interceptor";
import {PageOptions} from "@/business/models";
import {BusinessError} from "@/handler/models";
import {eq} from "drizzle-orm";

export interface TemplateConfig<TModel> {
    repository: Repository<TModel>,
    conditionSearch?: (search: any) => ConditionFunc,
    conditionMatchId?: (id: string) => ConditionFunc,
    checkCreate?: (model: TModel, params: any) => Promise<void>,
    checkUpdate?: (id: string, model: Partial<TModel>, params: any) => Promise<void>,
    filename: (model: TModel) => string,
    exportHandler?: (model: TModel, uint8arr: Uint8Array) => Promise<ReadableStream>,
    importHandler?: (uint8arr: Uint8Array) => Promise<TModel>,
}

export function apiGetModelList<TModel>({repository, conditionSearch}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const options = records.searchParams as PageOptions;
        const models = await repository
            .getList(options, conditionSearch?.(options.search));
        return NextResponse.json(models);
    }
}

export function apiGetModel<TModel>({repository, conditionMatchId}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id} = await records.context.params;
        const {withDetails} =
            records.searchParams as { withDetails?: boolean };
        const model = await repository
            .get(id, withDetails, conditionMatchId?.(id));
        return NextResponse.json(model);
    }
}

export function apiCreateModel<TModel>({repository, checkCreate}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const model = await request.json() as TModel;

        if (checkCreate) {
            await checkCreate(model, records.searchParams);
        }

        const result = await repository.create(model);

        return NextResponse.json(result);
    }
}

export function apiUpdateModel<TModel>({repository, checkUpdate}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id} = await records.context.params;
        const model = await request.json() as Partial<TModel>;
        if (checkUpdate) {
            await checkUpdate(id, model, records.searchParams);
        }
        const result = await repository.update(id, model);
        return NextResponse.json(result);
    }
}

export function apiDeleteModel<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id} = await records.context.params;
        await repository.delete(id);
        return NextResponse.json(null);
    }
}

export function apiExportModel<TModel>(
    {
        repository,
        conditionMatchId,
        filename,
        exportHandler
    }: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id} = await records.context.params;
        const model = await repository
            .get(id, true, conditionMatchId?.(id));
        if (model === null)
            throw new BusinessError('entity not found.',
                "default.entity_not_found")
                .withValue("id", id);

        // 1. 将 JSON 对象转为字符串
        const json = JSON.stringify(model);
        // 2. 创建 Web 标准的 ReadableStream（不是 Node.js 的 stream.ReadableStream）
        const encoder = new TextEncoder();
        const uint8arr = encoder.encode(json);
        const stream: ReadableStream = exportHandler ?
            await exportHandler(model, uint8arr) :
            new ReadableStream({
                start(controller) {
                    // 将 JSON 字符串编码为 Uint8Array 并加入流
                    controller.enqueue(uint8arr);
                    controller.close();  // 关闭流
                }
            });
        // 3. 设置响应头，触发下载
        const headers = new Headers();
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename(model))}`);
        return new NextResponse(stream, {status: 200, headers});
    }
}

export function apiImportModel<TModel>({repository, importHandler}: TemplateConfig<TModel>): NextHandler {
    return async (request, _) => {
        const buffer = await request.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        let model: any;
        if (importHandler) {
            model = await importHandler(uint8);
        } else {
            model = JSON.parse(new TextDecoder('utf-8').decode(uint8));
        }

        const exist = await repository.exist(e => eq(e.id, model.id));
        if (exist) {
            await repository.delete(model.id);
        }

        const result = await repository.create(model);

        return NextResponse.json(result);
    }
}


export function apiGetEntryList<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id, entryType} = await records.context.params as { id: string, entryType: string };
        const options = records.searchParams as PageOptions;
        const models = await repository.entry.getList(id, entryType, options);
        return NextResponse.json(models);
    }
}

export function apiCreateEntry<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType} = await records.context.params as { id: string, entryType: string };
        const model = await request.json();
        const entryId = await repository.entry.create(id, entryType, model);
        return NextResponse.json({id: entryId});
    }
}

export function apiGetEntry<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const entry = await repository.entry.get(id, entryType, entryId);
        return NextResponse.json(entry);
    }
}

export function apiUpdateEntry<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const model = await request.json();
        await repository.entry.update(id, entryType, entryId, model);
        return NextResponse.json(model);
    }
}

export function apiDeleteEntry<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id, entryType, entryId} = await records.context.params;
        await repository.entry.delete(id, entryType, entryId);
        return NextResponse.json(null);
    }
}

export function apiDisableEntry<TModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.context.params;
        const {disabled} = await request.json() as { disabled: boolean };
        await repository.entry.setDisabled(id, entryType, entryId, disabled);
        return NextResponse.json(null);
    }
}