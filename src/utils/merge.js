function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export default function merge(target, source) {
  return isObject(target) && isObject(source)
    ? Object.keys(target)
        .concat(Object.keys(source))
        .reduce(
          (acc, key) =>
            target[key] && source[key]
              ? { ...acc, [key]: merge(target[key], source[key]) }
              : source[key] ? { ...acc, [key]: source[key] } : acc,
          { ...target }
        )
    : Array.isArray(target) && Array.isArray(source)
      ? [...target, ...source.filter(i => !target.includes(i))]
      : target;
}
