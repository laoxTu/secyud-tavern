import { and, count, eq, like, sql, SQL } from 'drizzle-orm';
import { v4 } from 'uuid';

import {
  ComfyUIParam,
  ComfyUIParamRequestParam,
  ComfyUIWorkflow,
  ComfyUIWorkflowRequestParam,
} from '@/comfyui';
import { DataRequest, DataResponse } from '@/database';
import { AnyQuery, databases } from '@/database/server';
import { checker } from '@/interceptors';

import { comfyuiParamSchema, comfyuiWorkflowSchema } from './schema';

const { db } = databases;

const param = {
  async list(
    id: string,
    request?: DataRequest<ComfyUIParamRequestParam>,
  ): Promise<DataResponse<ComfyUIParam>> {
    const { skip, size, search } = request ?? {};

    const conditions = [eq(comfyuiParamSchema.masterId, id)];

    if (search) {
      const { filter } = search;
      if (filter) {
        conditions.push(like(comfyuiParamSchema.name, `%${filter}%`));
      }
    }

    const condition = and(...conditions);
    const countQuery: AnyQuery = db
      .select({ count: count() })
      .from(comfyuiParamSchema)
      .where(condition);
    let itemsQuery: AnyQuery = db
      .select()
      .from(comfyuiParamSchema)
      .where(condition);

    if (size) {
      itemsQuery = itemsQuery.offset(skip ?? 0).limit(size);
    }
    const [[{ count: length }], items] = await Promise.all([
      countQuery,
      itemsQuery,
    ]);
    return { items: items as ComfyUIParam[], length };
  },
  /**
   * 获取参数
   * @param id 故事的ID
   * @param sequence
   */
  async get(id: string, sequence: number) {
    const param: ComfyUIParam | undefined = await db
      .select()
      .from(comfyuiParamSchema)
      .where(
        and(
          eq(comfyuiParamSchema.masterId, id),
          eq(comfyuiParamSchema.sequence, sequence),
        ),
      )
      .get();
    return param;
  },
  /**
   * 创建参数
   */
  async add(id: string, param: ComfyUIParam) {
    param.masterId = id;
    const [{ sequence }] = await db
      .select({
        sequence: sql<number>`max(${comfyuiParamSchema.sequence})`,
      })
      .from(comfyuiParamSchema)
      .where(eq(comfyuiParamSchema.masterId, id));
    param.sequence = (sequence ?? -1) + 1;
    await db.insert(comfyuiParamSchema).values(param);
    return param.sequence;
  },
  /**
   * 创建参数
   */
  async make(id: string, params: ComfyUIParam[]) {
    const [{ sequence: max }] = await db
      .select({
        sequence: sql<number>`max(${comfyuiParamSchema.sequence})`,
      })
      .from(comfyuiParamSchema)
      .where(eq(comfyuiParamSchema.masterId, id));
    const sequence = (max ?? -1) + 1;
    await db.insert(comfyuiParamSchema).values(
      params.map((u, i) => ({
        ...u,
        masterId: id,
        sequence: sequence + i,
      })),
    );
  },
  /**
   * 更新参数
   * @param id
   * @param sequence 使用序号，因为更新时已经获取参数
   * @param param 更新的参数
   */
  async set(id: string, sequence: number, param: Partial<ComfyUIParam>) {
    // 参数禁止更新主键
    param.masterId = undefined!;
    param.sequence = undefined!;
    await db
      .update(comfyuiParamSchema)
      .set(param)
      .where(
        and(
          eq(comfyuiParamSchema.masterId, id),
          eq(comfyuiParamSchema.sequence, sequence),
        ),
      );
  },
  /**
   * 更新参数
   * @param id
   * @param sequence 使用序号，因为更新时已经获取参数
   */
  async del(id: string, sequence: number) {
    await db
      .delete(comfyuiParamSchema)
      .where(
        and(
          eq(comfyuiParamSchema.masterId, id),
          eq(comfyuiParamSchema.sequence, sequence),
        ),
      );
  },
};

async function get(id: string) {
  const comfyuiWorkflowOrNull = await databases.get<
    ComfyUIWorkflow,
    typeof comfyuiWorkflowSchema
  >(comfyuiWorkflowSchema, id);
  return checker.notNullEntity(id, comfyuiWorkflowOrNull, 'comfyuiWorkflow.id');
}

async function create(comfyuiWorkflow: ComfyUIWorkflow) {
  checker.notNullOrWhitespace('name', comfyuiWorkflow.name);
  if (!comfyuiWorkflow.id) comfyuiWorkflow.id = v4();
  await db.insert(comfyuiWorkflowSchema).values(comfyuiWorkflow);
  return comfyuiWorkflow.id;
}

async function update(id: string, comfyuiWorkflow: Partial<ComfyUIWorkflow>) {
  checker.notWhitespace('name', comfyuiWorkflow.name);
  comfyuiWorkflow.id = undefined;
  await db
    .update(comfyuiWorkflowSchema)
    .set(comfyuiWorkflow)
    .where(eq(comfyuiWorkflowSchema.id, id));
}

async function _delete(id: string) {
  await databases.delete(comfyuiWorkflowSchema, id);
}

async function exist(condition: (table: typeof comfyuiWorkflowSchema) => SQL) {
  return await databases.exists(comfyuiWorkflowSchema, condition);
}

/**
 * list只挑选name value值
 * @param request
 */
async function list(request: DataRequest<ComfyUIWorkflowRequestParam>) {
  return await databases.query<ComfyUIWorkflow, typeof comfyuiWorkflowSchema>(
    comfyuiWorkflowSchema,
    request,
    (t) => {
      const condition: SQL[] = [];
      if (request.search) {
        const { fuzzy } = request.search;
        if (fuzzy) {
          condition.push(like(t.name, `%${fuzzy}%`));
        }
      }

      return condition.length ? and(...condition) : undefined;
    },
    (t) => t.name,
    (t) => ({
      id: t.id,
      name: t.name,
    }),
  );
}

export const workflowRepository = {
  get,
  create,
  update,
  delete: _delete,
  list,
  exist,
  param,
};
