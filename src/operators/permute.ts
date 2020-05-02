function flatten(items) {
  return [].concat.apply([], items);
}

export function permute(items, max) {
  function _do(items, omitted) {
    return items.length > 1 && items.length > omitted
      ? flatten(
          items.map((item, i) =>
            _do(items.slice(i + 1).concat(items.slice(0, i)), omitted).map(p =>
              [items[i]].concat(p)
            )
          )
        )
      : items.map(i => [i]);
  }

  return _do(items, typeof max === "undefined" ? 0 : items.length - (max - 1));
}

function reduce(mods, obj) {
  const { getters, setters } = mods.reduce(
    (acc, [getter, setter]) => ({
      getters: [...acc.getters, getter],
      setters: [...acc.setters, setter]
    }),
    { getters: [], setters: [] }
  );

  const vals = getters.map(g => g(obj));
  const permutations = permute(vals);

  return permutations.map(permutation =>
    setters.reduce((acc, setter, i) => setter(acc, permutation[i]), obj)
  );
}

export function permuteObject(props, obj) {
  return reduce(
    props.map(prop => [x => x[prop], (x, v) => ({ ...x, [prop]: v })]),
    obj
  );
}

export function permuteArray(indexes, array) {
  return reduce(
    indexes.map(i => [
      x => x[i],
      (x, v) =>
        x
          .slice(0, i)
          .concat([v])
          .concat(x.slice(i + 1))
    ]),
    array
  );
}
