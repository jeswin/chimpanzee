import { modify } from "../../../index.js";
import { any } from "../../../operators/any";

export const input = {
  hello: "world",
};

export const schema = {
  hello: modify(
    (x) => x === "world",
    (result: any) => `${result}!!!`
  ),
};
