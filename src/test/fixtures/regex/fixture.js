import { traverse, regex } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: regex(/^world$/)
});
