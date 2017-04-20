import { traverse, string } from "../../../chimpanzee";

export const input = {
  hello: true
};

export const schema = traverse({
  hello: string()
});
