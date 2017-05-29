import { object, wrap } from "../../../chimpanzee";

export const input = {
  hello: { world: "again" }
};

export const schema = {
  hello: wrap(object(), { key: "wrapped" })
};
