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

export const checker = {
  code: '[A-Za-z0-9_]+',
  validateCode(fieldName: string, value?: string | null, namespace?: string) {
    if (value && /^[A-Za-z0-9_]$/.test(value)) return value;
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
    if (jsonUtils.parse(value)) return value ?? '';
    return throwInvalidJson(name);
  },

  validJsonOrEmpty(value?: string | null, name?: string) {
    if (!value?.trim() || jsonUtils.parse(value)) return value ?? '';
    return throwInvalidJson(name);
  },

  notNullEntity<T>(id: string, entity?: T | null, target?: string) {
    if (entity) return entity;
    throw new BusinessError('entity not found', 'default.entity_not_found')
      .withValue('id', id)
      .withValue('target', target ?? 'default.target');
  },
} as const;
