function except(message) {
  throw new Error(message);
}

export function wrap(item, meta) {
  return {  __wrappedItem: item, ...meta };
}

export function unwrap(wrapped) {
  return wrapped.__wrappedItem || except("This is not a wrapped object.");
}

export function isWrapped(wrapped) {
  return typeof wrapped.__wrappedItem !== "undefined";
}

export function getType(wrapped) {
  return isWrapped(wrapped)
    ? wrapped.type
    : undefined
}

export function error(message, params) {
  return wrap({ ...params, message }, { type: "error" })
}

export function skip(message, params) {
  return wrap({ ...params, message }, { type: "skip" })
}

export function ret(value, params) {
  return wrap({ ...params, value }, { type: "return" })
}

export function none() {
  return ret(undefined, { empty: true })
}
