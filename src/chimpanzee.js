/* @flow */

import parse from "./parse";

export { default as parse } from "./parse";
export { any } from "./operators/any";
export { capture, captureIf, captureAndParse, literal, modify, take } from "./operators/capture";
export { composite } from "./operators/composite";
export { deep } from "./operators/deep";
export { empty } from "./operators/empty";
export { exists } from "./operators/exists";
export { map } from "./operators/map";
export { number, bool, string, object, func } from "./operators/types";
export { optional } from "./operators/optional";
export { regex } from "./operators/regex";
export { repeatingItem, unorderedItem, optionalItem, array } from "./operators/array";

export { Match, Empty, Skip, Fault } from "./results";

import * as builtins from "./operators/builtins";
export { builtins };

import type { Result } from "./results";

export function match(schema: any, input: any) : Result {
  return parse(schema)(input, "__INIT__")();
}
