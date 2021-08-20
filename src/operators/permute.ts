import { IObject } from "../types.js";

// Boris Yuzhakov's one liner.
export function permute<T>(a: Array<T>): Array<Array<T>> {
  return a.length
    ? a.reduce(
        (r, v, i) => [
          ...r,
          ...permute([...a.slice(0, i), ...a.slice(i + 1)]).map((x) => [
            v,
            ...x,
          ]),
        ],
        [] as Array<Array<T>>
      )
    : [[]];
}

/*
  permuteObject(props, input);

  permuteObject(["left", "right"], {
    x: 1,
    left: "a",
    right: "b"
  })
    returns:
      [
        { x: 1, left: "a", right: "b" },
        { x: 1, left: "b", right: "a" }
      ]
*/

export function permuteObject(indexes: string[], obj: IObject): Array<IObject> {
  const permutedIndexesList = permute(indexes);

  return permutedIndexesList.map((permutedIndexes) => {
    return indexes.reduce(
      (acc: IObject, index: string, i: number) => {
        const swappedIndex = permutedIndexes[i];
        acc[index] = obj[swappedIndex];
        return acc;
      },
      { ...obj }
    );
  });
}

/*
  permuteArray(indexes, input);

  permuteArray([0, 1, 2], [1, 2, 3])
    returns:
      [
        [1, 2, 3],
        [1, 3, 2],
        [2, 3, 1],
        [2, 1, 3],
        [3, 1, 2],
        [3, 2, 1]
      ]
*/
export function permuteArray(
  indexes: number[],
  array: Array<any>
): Array<Array<any>> {
  const permutedIndexesList = permute(indexes);

  return permutedIndexesList.map((permutedIndexes) =>
    indexes.reduce(
      (acc: Array<any>, index: number, i: number) => {
        const swappedIndex = permutedIndexes[i];
        acc[index] = array[swappedIndex];
        return acc;
      },
      [...array]
    )
  );
}
