import { traverse, literal } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: literal("world")
});
