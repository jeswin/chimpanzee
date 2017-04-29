/* @flow */
import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "./types";

import Schema from "./schema";

export { traverse } from "./traverse";
export { composite } from "./operators/composite";
export {
  capture,
  captureIf,
  captureAndTraverse,
  literal,
  take
} from "./operators/capture";
export { any } from "./operators/any";
export { map } from "./operators/map";
export { optional } from "./operators/optional";
export { deep } from "./operators/deep";
export { empty } from "./operators/empty";
export { exists } from "./operators/exists";
export { number, bool, string, object, func } from "./operators/types";
export { regex } from "./operators/regex";

export {
  repeatingItem,
  unorderedItem,
  optionalItem,
  array
} from "./operators/array";

export { Match, Empty, Skip, Fault } from "./results";

export { default as Schema } from "./schema";

export { waitForSchema } from "./utils";

function _match(traverseResult: ResultGeneratorType) {
  const result = traverseResult;
  return typeof result === "function" ? _match(result()) : result;
}

export function match(schema: Schema<any>, input: any) {
  const fn = typeof schema === "function" ? schema : schema.fn;
  return _match(fn(input, "__INIT__", [], []));
}
