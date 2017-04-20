import { traverse, func } from "../../../chimpanzee";

export function testFunc() {}

export const input = {
  hello: testFunc
};

export const schema = traverse({
  hello: func()
});
