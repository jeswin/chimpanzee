export function wrap(item, meta) {
  return { __isWrapped: true, __item: item, ...meta };
}

export function unwrap(wrapped) {
  const { __isWrapped, __item } = wrapped;
  if (__isWrapped) {
    return __item;
  } else {
    throw new Error("This is not a wrapped object.");
  }
}

export function isWrapped(wrapped) {
  return wrapped.__isWrapped;
}

export function error(message) {
  return { type: "error", message };
}

export function skip(message) {
  return { type: "skip", message };
}

export function ret(value) {
  return { type: "return", value }
}
