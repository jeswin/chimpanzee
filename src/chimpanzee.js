/* @flow */
import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType
} from "./types";

import { FunctionalSchema } from "./schema";
import { parse } from "./utils";

export { traverse } from "./operators/traverse";
export { composite } from "./operators/composite";
export { capture, captureIf, captureAndTraverse, literal, take } from "./operators/capture";
export { any } from "./operators/any";
export { map } from "./operators/map";
export { optional } from "./operators/optional";
export { deep } from "./operators/deep";
export { empty } from "./operators/empty";
export { exists } from "./operators/exists";
export { number, bool, string, object, func } from "./operators/types";
export { regex } from "./operators/regex";

export { repeatingItem, unorderedItem, optionalItem, array } from "./operators/array";

export { Match, Empty, Skip, Fault } from "./results";

export { default as Schema } from "./schema";

export { parse } from "./utils";

export function match(schema, input) {
  return parse(schema)(input, "__INIT__", [], [])({});
}
