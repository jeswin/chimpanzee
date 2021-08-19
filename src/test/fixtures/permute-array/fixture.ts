import { permuteArray } from "../../../index.js";

export function fn() {
  const result = permuteArray([1, 2], [10, 20, 30]);
  result.should.deepEqual([[10, 20, 30], [10, 30, 20]]);
}
