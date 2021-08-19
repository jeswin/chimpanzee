import { builtins as $, literal, capture } from "../../../index.js";

export const input = ["world"];

export const schema = $.arr([
  literal("world!!!", {
    modifiers: { object: (x: any) => `${x}!!!` },
  }),
]);
