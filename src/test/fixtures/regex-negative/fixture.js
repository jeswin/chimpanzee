import { traverse, regex } from "../../../chimpanzee";

export const input = {
  hello: "planet"
};

export const schema = traverse({
  hello: regex(/^world$/)
});
