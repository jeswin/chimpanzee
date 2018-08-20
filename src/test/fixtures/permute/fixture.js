import { permute } from "../../../";

export function fn() {
  const result = permute([1, 2, 3]);

  result.should.deepEqual([
    [1, 2, 3],
    [1, 3, 2],
    [2, 3, 1],
    [2, 1, 3],
    [3, 1, 2],
    [3, 2, 1]
  ]);
}
