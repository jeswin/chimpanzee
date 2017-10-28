import { wrap, object, capture } from "../../../chimpanzee";

export const input = {
  hello: "world",
  next: { inner: "world", text: "yaay" }
};

export const schema = wrap({
  hello: capture("key")
}).then(result => ({
  next: { inner: result.key, text: capture() }
}));
