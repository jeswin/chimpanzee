import { func } from "../../../index.js";

export function testFunc() {}

export const input = {
  hello: testFunc
};

export const schema = {
  hello: func()
};
