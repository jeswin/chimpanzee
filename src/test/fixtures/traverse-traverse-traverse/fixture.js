import { traverse, literal } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = {
  hello: traverse(traverse(traverse(literal("world"))))
};
