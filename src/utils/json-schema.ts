interface JsonPropertyBase {
    description?: string,
}

export interface RefProperty {
    $ref: string,
}

export interface StringProperty extends JsonPropertyBase {
    type: "string",
    pattern?: string,
    format?: "email" | "hostname" | "ipv4" | "ipv6" | "uuid",
    enum?: string[],
}

export interface NumberProperty extends JsonPropertyBase {
    type: "number" | "integer",
    const?: number,
    default?: number,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: number,
    exclusiveMaximum?: number,
    multipleOf?: number,
}

export interface BooleanProperty extends JsonPropertyBase {
    type: "boolean",
}

export interface ArrayProperty extends JsonPropertyBase {
    type: "array",
    items: JsonSchemaProperty,
}

export interface JsonProperty extends JsonPropertyBase {
    type: "object",
    properties?: JsonSchemaProperties,
    required?: string[],
    additionalProperties: boolean,
}

export type JsonSchemaProperty =
    RefProperty
    | StringProperty
    | NumberProperty
    | BooleanProperty
    | ArrayProperty
    | JsonProperty
    | { anyOf: JsonSchemaProperty[] };
export type JsonSchemaProperties = Record<string, JsonSchemaProperty>;

export interface JsonSchema extends Omit<JsonProperty, "description"> {
    $def?: JsonSchemaProperties,
}