import { builtins as $, literal, capture } from "../../../chimpanzee";

export const input = ["world"];

export const schema = $.arr([
  literal("world!!!", {
    modifiers: { object: x => `${x}!!!` }
  })
]);
