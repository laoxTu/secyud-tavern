import {NextResponse} from "next/server";
import {ConditionFunc, Repository} from "@/business/server/repository";
import {NextHandler} from "@/handler/server/interceptor";
import {BaseModel, PageOptions} from "@/business/models";
import {BusinessError} from "@/handler/models";
import {eq} from "drizzle-orm";

export interface TemplateConfig<TModel extends BaseModel> {
    repository: Repository<TModel>,
    conditionSearch?: (search: any) => ConditionFunc,
    conditionMatchId?: (id: string) => ConditionFunc,
    checkCreate?: (model: TModel, params: any) => Promise<void>,
    checkUpdate?: (id: string, model: Partial<TModel>, params: any) => Promise<void>,
    filename: (model: TModel) => string,
    exportHandler?: (model: TModel) => Promise<ReadableStream>,
    importHandler?: (uint8arr: Uint8Array) => Promise<TModel | TModel[]>,
}

export function apiGetModelList<TModel extends BaseModel>({
                                                              repository,
                                                              conditionSearch
                                                          }: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const options = records.searchParams as PageOptions;
        const models = await repository
            .getList(options, conditionSearch?.(options.search));
        return NextResponse.json(models);
    }
}

export function apiGetModel<TModel extends BaseModel>(
    {
        repository,
        conditionMatchId
    }: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id} = await records.params;
        const {withDetails} =
            records.searchParams as { withDetails?: boolean };
        const model = await repository
            .get(id, withDetails, conditionMatchId?.(id));
        return NextResponse.json(model);
    }
}

export function apiCreateModel<TModel extends BaseModel>({
                                                             repository,
                                                             checkCreate
                                                         }: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const model = await request.json() as TModel;

        if (checkCreate) {
            await checkCreate(model, records.searchParams);
        }

        const result = await repository.create(model);

        return NextResponse.json(result);
    }
}

export function apiUpdateModel<TModel extends BaseModel>(
    {
        repository,
        checkUpdate
    }: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id} = await records.params;
        const model = await request.json() as Partial<TModel>;
        if (checkUpdate) {
            await checkUpdate(id, model, records.searchParams);
        }
        const result = await repository.update(id, model);
        return NextResponse.json(result);
    }
}

export function apiDeleteModel<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id} = await records.params;
        await repository.delete(id);
        return NextResponse.json(null);
    }
}

export function apiExportModel<TModel extends BaseModel>(
    {
        repository,
        conditionMatchId,
        filename,
        exportHandler
    }: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id} = await records.params;
        const model = await repository
            .get(id, true, conditionMatchId?.(id));
        if (model === null)
            throw new BusinessError('entity not found.',
                "default.entity_not_found")
                .withValue("id", id);

        // 1. 将 JSON 对象转为字符串
        const stream: ReadableStream = exportHandler ?
            await exportHandler(model) :
            new ReadableStream({
                start(controller) {
                    // 将 JSON 字符串编码为 Uint8Array 并加入流
                    controller.enqueue(new TextEncoder()
                        .encode(JSON.stringify(model)));
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

export function apiImportModel<TModel extends BaseModel>({
                                                             repository,
                                                             importHandler
                                                         }: TemplateConfig<TModel>): NextHandler {
    return async (request, _) => {
        const buffer = await request.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        let importInput: TModel | TModel[];
        if (importHandler) {
            importInput = await importHandler(uint8);
        } else {
            importInput = JSON.parse(new TextDecoder('utf-8').decode(uint8));
        }

        const models = Array.isArray(importInput) ? importInput : [importInput];

        for (const model of models) {
            const exist = await repository.exist(e => eq(e.id, model.id));
            if (exist) {
                await repository.delete(model.id);
            }
            await repository.create(model);
        }
        return NextResponse.json(models[0]);
    }
}


export function apiGetEntryList<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id, entryType} = await records.params as { id: string, entryType: string };
        const options = records.searchParams as PageOptions;
        const models = await repository.entry.getList(id, entryType, options);
        return NextResponse.json(models);
    }
}

export function apiCreateEntry<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType} = await records.params as { id: string, entryType: string };
        const model = await request.json();
        const entryId = await repository.entry.create(id, entryType, model);
        return NextResponse.json({id: entryId});
    }
}

export function apiGetEntry<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id, entryType, entryId} = await records.params;
        const entry = await repository.entry.get(id, entryType, entryId);
        return NextResponse.json(entry);
    }
}

export function apiUpdateEntry<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.params;
        const model = await request.json();
        await repository.entry.update(id, entryType, entryId, model);
        return NextResponse.json(model);
    }
}

export function apiDeleteEntry<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (_, records) => {
        const {id, entryType, entryId} = await records.params;
        await repository.entry.delete(id, entryType, entryId);
        return NextResponse.json(null);
    }
}

export function apiDisableEntry<TModel extends BaseModel>({repository}: TemplateConfig<TModel>): NextHandler {
    return async (request, records) => {
        const {id, entryType, entryId} = await records.params;
        const {disabled} = await request.json() as { disabled: boolean };
        await repository.entry.setDisabled(id, entryType, entryId, disabled);
        return NextResponse.json(null);
    }
}