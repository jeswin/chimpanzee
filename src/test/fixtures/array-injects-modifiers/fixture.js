import { builtins as $, literal, capture } from "../../../chimpanzee";

export const input = ["world"];

export const schema = $.arr(["world!!!"], {
  modifiers: { value: x => `${x}!!!` }
});
