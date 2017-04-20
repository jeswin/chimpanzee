export { traverse } from "./traverse";
export { composite } from "./operators/composite";
export {
  capture,
  captureIf,
  captureAndTraverse,
  literal,
  modify,
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

function _match(traverseResult) {
  const result = traverseResult;
  return typeof result === "function" ? _match(result()) : result;
}

export function match(schema, input) {
  const fn = typeof schema === "function" ? schema : schema.fn;
  return _match(fn(input, {}, "__INIT__", [], []));
}
