import { wrap, object, capture, Skip } from "../../../index.js";

export const input = {
  hello: "world",
  does: "not exist",
  next: { inner: "world", text: "yaay" },
};

export const schema = wrap({
  hello: capture("key"),
  does: "exist",
}).then(
  (result: any) => ({
    next: { inner: result.value.key, text: capture() },
  }),
  (result: any) =>
    result instanceof Skip ? new Skip("That is an error.", {} as any) : result
);
