export function shallowClone(obj: any) {
  return typeof obj === "object" && obj.constructor === Object
    ? { ...obj }
    : Array.isArray(obj)
    ? [...obj]
    : obj;
}
