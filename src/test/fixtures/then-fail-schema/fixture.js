import { wrap, object, capture, Skip } from "../../../chimpanzee";

export const input = {
  hello: "world",
  does: "not exist",
  next: { inner: "world", text: "yaay" }
};

export const schema = wrap({
  hello: capture("key"),
  does: "exist"
}).then(
  result => ({
    next: { inner: result.key, text: capture() }
  }),
  result => (result instanceof Skip ? new Skip("That is an error.") : result)
);
