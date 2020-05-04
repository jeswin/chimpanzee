import { wrap, object, capture } from "../../../";

export const input = {
  hello: "world",
  next: { inner: "world", text: "yaay" },
};

export const schema = wrap({
  hello: capture("key"),
}).then((result: any) => ({
  next: { inner: result.value.key, text: capture() },
}));
