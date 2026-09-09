'use client';
import { Realm } from '@/stories';
import { realms } from '@/stories/client/realms';
import { ToolItem, ToolProvider } from '@/tools/client';
import { extract, Operation, validate } from '@/utils';

export const variables: ToolProvider = {
  id: 'variable',
  async create(entry, realm) {
    return [getVariable(realm), setVariable(realm), delVariable(realm)];
  },
};

function getVariable(realm: Realm): ToolItem<{ path: string }> {
  return {
    name: 'get_variable',
    description: 'get the value of the variable object by path',
    parameters: {
      type: 'object',
      additionalProperties: false,
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'path, use "/" separate',
        },
      },
    },
    async invoke({ path }) {
      const history = realm.histories.at(-1);
      // 读取当前变量（含本轮未落盘的变更，让模型看到刚改完的状态）。
      const variables = history ? realms.variables(history, true) : {};
      const { current, exists } = extract(variables, path, false);
      // 返回标准化路径、值和是否存在，供模型判断后续读写。
      return exists ? JSON.stringify(current.item) : `result: not exists`;
    },
  };
}

function operate(operation: Operation, realm: Realm) {
  const history = realm.histories.at(-1);
  const currentOutput = realms.outputs(history)?.at(-1);
  if (currentOutput) {
    // 变更记入本轮输出的 variables，输出保存后由 generateCurrentVariables 统一应用。
    const validation = validate(operation);
    if (validation) {
      return `error: ${validation}`;
    }
    currentOutput.variables.push(operation);
  }
  return 'success';
}

function setVariable(realm: Realm): ToolItem {
  return {
    name: 'set_variable',
    description: 'use JSON patch to set variable.',
    parameters: {
      type: 'object',
      required: ['path', 'value'],
      properties: {
        path: {
          type: 'string',
          description: 'A JSON Pointer path. split by "/"',
        },
        value: {
          anyOf: [
            {
              type: 'object',
              additionalProperties: true,
            },
            {
              type: 'string',
            },
            {
              type: 'number',
            },
            {
              type: 'boolean',
            },
          ],
        },
      },
    },
    async invoke(operation) {
      return operate({ ...operation, op: 'replace' }, realm);
    },
  };
}

function delVariable(realm: Realm): ToolItem {
  return {
    name: 'del_variable',
    description: 'use JSON patch to del variable.',
    parameters: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string',
          description: 'A JSON Pointer path. split by "/"',
        },
      },
    },
    async invoke(operation) {
      return operate({ ...operation, op: 'remove' }, realm);
    },
  };
}
