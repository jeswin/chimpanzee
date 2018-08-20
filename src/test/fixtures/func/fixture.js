import { func } from "../../../";

export function testFunc() {}

export const input = {
  hello: testFunc
};

export const schema = {
  hello: func()
};
