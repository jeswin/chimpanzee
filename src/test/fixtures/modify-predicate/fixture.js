import { traverse, modify } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = traverse({
  hello: modify(x => x === "world", x => `${x}!!!`)
});
