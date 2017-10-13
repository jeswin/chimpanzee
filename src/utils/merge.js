function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export default function merge(target, source, options) {
  return isObject(target) && isObject(source)
    ? Object.keys(target)
        .concat(Object.keys(source))
        .reduce(
          (acc, key) =>
            target[key] && source[key]
              ? { ...acc, [key]: merge(target[key], source[key], options) }
              : source[key] ? { ...acc, [key]: source[key] } : acc,
          { ...target }
        )
    : Array.isArray(target) && Array.isArray(source)
      ? options.mergeArray
        ? (() => {
            const [longer, shorter] =
              target.length > source.length
                ? [target, source]
                : [source, target];
            return longer.reduce(
              (acc, item, i) =>
                acc.concat(
                  i < shorter.length
                    ? isObject(item) && isObject(shorter[i])
                      ? [merge(item, shorter[i])]
                      : [item, shorter[i]]
                    : [i]
                ),
              []
            );
          })()
        : [...target, ...source.filter(i => !target.includes(i))]
      : target;
}
