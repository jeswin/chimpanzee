import { traverse, capture } from "../../../chimpanzee";

export const input = {
  hello: "world",
  "something": "else"
}

export const schema = traverse({
  hello:  "world!!!",
  something: capture()
}, { modifiers: { value: x => `${x}!!!` } })
