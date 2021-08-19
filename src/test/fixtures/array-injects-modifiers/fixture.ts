import { builtins as $, literal, capture } from "../../../index.js";

export const input = ["world"];

export const schema = $.arr(["world!!!"], {
  modifiers: { value: (x: any) => `${x}!!!` },
});
