import { jsonUtils } from '@/utils';

export class BusinessError extends Error {
  data: Record<string, any> = {};
  code?: string;
  innerError?: any;
  status: number;

  constructor(
    message: string,
    code?: string,
    innerError?: any,
    status: number = 500,
  ) {
    super(message);
    this.code = code;
    this.innerError = innerError;
    this.status = status;
  }

  withValue(key: string, value: any) {
    this.data[key] = value;
    return this;
  }

  withValues(obj: any) {
    this.data = jsonUtils.merge(this.data, obj);
    return this;
  }
}

function throwInvalidField(fieldName: string, namespace?: string): string {
  throw new BusinessError(
    `No ${fieldName} provided`,
    'error.empty_field',
  ).withValue('field', `${namespace ?? 'default'}.${fieldName}`);
}

function throwInvalidJson(name?: string): string {
  throw new BusinessError(`Json is invalid`, 'error.json_invalid').withValue(
    'target',
    name ?? 'default.field',
  );
}

/**
 * 判断文本能否解析成 JSON。
 * 不能用解析结果的真值来判断：'0' / 'false' / 'null' 都是合法 JSON，但解析出来是假值。
 */
function parseable(value?: string | null): boolean {
  try {
    JSON.parse(value ?? '');
    return true;
  } catch {
    return false;
  }
}

export const checker = {
  code: '[A-Za-z0-9_]+',
  validateCode(fieldName: string, value?: string | null, namespace?: string) {
    if (value && /^[A-Za-z0-9_]+$/.test(value)) return value;
    throw new BusinessError(`code is invalid`, 'error.invalid_code').withValue(
      'field',
      `${namespace ?? 'default'}.${fieldName}`,
    );
  },
  duplicate(exist: boolean, entity: string, name: string, value: string) {
    if (!exist) return exist;
    throw new BusinessError(
      `${entity} with ${name} ${value} already exist`,
      'error.entity.duplicate_value',
    ).withValues({ entity, name, value });
  },

  notNullOrEmpty<T = string>(
    fieldName: string,
    value?: T | null,
    namespace?: string,
  ) {
    if (value) return value;
    return throwInvalidField(fieldName, namespace);
  },

  notNullOrWhitespace(
    fieldName: string,
    value?: string | null,
    namespace?: string,
  ) {
    if (value?.trim()) return value;
    return throwInvalidField(fieldName, namespace);
  },

  notEmpty(fieldName: string, value?: string | null, namespace?: string) {
    if (value !== '') return value;
    throwInvalidField(fieldName, namespace);
  },

  notWhitespace(fieldName: string, value?: string | null, namespace?: string) {
    if (value?.trim() !== '') return value;
    throwInvalidField(fieldName, namespace);
  },

  validJson(value?: string | null, name?: string) {
    if (parseable(value)) return value ?? '';
    return throwInvalidJson(name);
  },

  validJsonOrEmpty(value?: string | null, name?: string) {
    if (!value?.trim() || parseable(value)) return value ?? '';
    return throwInvalidJson(name);
  },

  notNullEntity<T>(id: string, entity?: T | null, target?: string) {
    if (entity) return entity;
    throw new BusinessError('entity not found', 'default.entity_not_found')
      .withValue('id', id)
      .withValue('target', target ?? 'default.target');
  },
} as const;

export const errors = {
  serialize(err: unknown): string {
    if (err instanceof BusinessError) {
      const inner = err.innerError
        ? {
            name: err.innerError.name,
            message: err.innerError.message,
            stack: err.innerError.stack,
          }
        : undefined;
      return JSON.stringify({
        name: err.name,
        message: err.message,
        stack: err.stack,
        data: err.data,
        code: err.code,
        inner,
      });
    }
    if (err instanceof Error) {
      return JSON.stringify({
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
    }
    return String(err);
  },
};
