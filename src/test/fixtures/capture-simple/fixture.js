import { traverse, capture } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: capture()
});
