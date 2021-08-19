import { object, wrap } from "../../../index.js";

export const input = {
  hello: { world: "again" }
};

export const schema = {
  hello: wrap(object(), { key: "wrapped" })
};
