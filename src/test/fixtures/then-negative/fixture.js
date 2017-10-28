import { wrap, object, capture } from "../../../chimpanzee";

export const input = {
  hello: "world",
  does: "not exist",
  next: { inner: "world", text: "yaay" }
};

export const schema = wrap({
  hello: capture("key"),
  does: "exist"
}).then(result => ({
  next: { inner: result.key, text: capture() }
}));
