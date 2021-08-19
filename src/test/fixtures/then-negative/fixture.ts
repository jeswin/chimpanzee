import { wrap, object, capture } from "../../../index.js";
import { any } from "../../../operators/any";

export const input = {
  hello: "world",
  does: "not exist",
  next: { inner: "world", text: "yaay" }
};

export const schema = wrap({
  hello: capture("key"),
  does: "exist"
}).then((result:any) => ({
  next: { inner: result.value.key, text: capture() }
}));
