import { object, wrap } from "../../../";

export const input = {
  hello: { world: "again" }
};

export const schema = {
  hello: wrap(object(), { key: "wrapped" })
};
