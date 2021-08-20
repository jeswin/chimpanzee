import parse from "./parse.js";

export { default as parse } from "./parse.js";

export { any } from "./operators/any.js";
export {
  capture,
  captureIf,
  captureAndParse,
  literal,
  modify,
  take,
} from "./operators/capture.js";
export { composite } from "./operators/composite.js";
export { deep } from "./operators/deep.js";
export { empty } from "./operators/empty.js";
export { exists } from "./operators/exists.js";
export { map } from "./operators/map.js";
export { bool, func, number, object, string } from "./operators/types.js";
export { optional } from "./operators/optional.js";
export { regex } from "./operators/regex.js";
export {
  optionalItem,
  recursive,
  repeating,
  unordered,
} from "./operators/array.js";
export { wrap } from "./operators/wrap.js";
export { permute, permuteArray, permuteObject } from "./operators/permute.js";

export { Empty, Fault, Match, Skip, Result } from "./results/index.js";

import * as builtins from "./operators/builtins.js";
import { Schema } from "./schemas/index.js";
import { LiteralSchema, AnySchema } from "./types.js";
export { builtins };

export function match(schema: AnySchema, input: any) {
  return parse(schema)(input, "__INIT__", [], [])({});
}
