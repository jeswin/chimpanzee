import { permuteObject } from "../../../";

export function fn() {
  const result = permuteObject(["left", "right"], {
    x: 1,
    left: "a",
    right: "b"
  });

  result.should.deepEqual([
    { x: 1, left: "a", right: "b" },
    { x: 1, left: "b", right: "a" }
  ]);
}
