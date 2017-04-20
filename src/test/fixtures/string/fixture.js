import { traverse, string } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: string()
});
