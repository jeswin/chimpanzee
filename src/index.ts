import parse from "./parse";

export { default as parse } from "./parse";

export { any } from "./operators/any";
export {
  capture,
  captureIf,
  captureAndParse,
  literal,
  modify,
  take,
} from "./operators/capture";
export { composite } from "./operators/composite";
export { deep } from "./operators/deep";
export { empty } from "./operators/empty";
export { exists } from "./operators/exists";
export { map } from "./operators/map";
export { bool, func, number, object, string } from "./operators/types";
export { optional } from "./operators/optional";
export { regex } from "./operators/regex";
export {
  optionalItem,
  recursive,
  repeating,
  unordered,
} from "./operators/array";
export { wrap } from "./operators/wrap";
export { permute, permuteArray, permuteObject } from "./operators/permute";

export { Empty, Fault, Match, Skip } from "./results";

import * as builtins from "./operators/builtins";
import { Schema } from "./schemas";
export { builtins };

export function match(schema: Schema<any>, input: any) {
  return parse(schema)(input, "__INIT__", [], [])({});
}
