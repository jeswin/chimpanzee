/* @flow */
import type {
  ContextType,
  InvokeType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "./types";

import { normalizeParams } from "./utils";

export class Schema {
  constructor(params, meta) {
    this.params = normalizeParams(params);
    this.meta = meta;
  }
}

export class ValueSchema extends Schema {
  constructor(value, params, meta) {
    if (!value) {
      throw new Error()
    }
    super(params, meta);
    this.value = value;
  }
}

export class FunctionalSchema extends Schema {
  constructor(fn, params, meta) {
    super(params, meta);
    this.fn = fn;
  }
}
