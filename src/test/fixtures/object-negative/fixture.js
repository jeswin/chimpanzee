import { traverse, object } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: object()
});
