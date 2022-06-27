import { Buffer } from 'node:buffer';

export enum BufferSchemaValue {
  String,
  Number,
  Date,
  Boolean,
}

export type BufferSchema = {
  [key: string]: BufferField | BufferSchema | BufferSchema[];
};

type BufferObjectField = string | number | Date | boolean;

type BufferObject = {
  [key: string]: BufferObjectField | BufferObject | BufferObject[];
};

export class BufferField {
  type: BufferSchemaValue;
  required: boolean;

  constructor(type: BufferSchemaValue, required = true) {
    this.type = type;
    this.required = required;
  }
}

export class BufferSerializer<T extends BufferObject> {
  schema: BufferSchema;

  constructor(schema: BufferSchema) {
    this.schema = schema;
  }

  toBuffer(object: object): Buffer {
    return Buffer.from(JSON.stringify(object));
  }

  fromBuffer(buffer: Buffer): T {
    const data = JSON.parse(buffer.toString());
    return this.parseObject(data, this.schema) as T;
  }

  private parseObject(data: any, schema: BufferSchema): BufferObject {
    const object: BufferObject = {};
    for (const key in schema) {
      const field = schema[key];
      if (field instanceof BufferField && !field.required && !data[key]) {
        continue;
      }

      object[key] = this.parseField(
        data[key],
        field instanceof BufferField ? field.type : field
      );
    }
    return object;
  }

  private parseField(
    value: any,
    type: BufferSchemaValue | BufferSchema | BufferSchema[]
  ): BufferObjectField | BufferObject | BufferObject[] {
    if (Array.isArray(type)) {
      const items = [];

      for (const item of value) {
        items.push(this.parseObject(item, type[0]));
      }
      return items;
    }

    if (typeof type === 'object') {
      return this.parseObject(value, type);
    }

    return this.parseFieldValue(value, type as BufferSchemaValue);
  }

  private parseFieldValue(
    value: any,
    type: BufferSchemaValue
  ): BufferObjectField {
    switch (type) {
      case BufferSchemaValue.Number:
        return +value;
      case BufferSchemaValue.Boolean:
        return !!value;
      case BufferSchemaValue.String:
        return `${value}`;
      case BufferSchemaValue.Date:
        return new Date(value);
    }
  }
}
