import { traverse, bool } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: bool()
});
