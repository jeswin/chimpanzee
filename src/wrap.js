export function wrap(item, meta) {
  return { __isWrapped: true, __item: item, ...meta };
}

export function unwrap(wrapped) {
  const { __isWrapped, __item } = wrapped;
  return __isWrapped ? __item : error("This is not a wrapped object.");
}

export function isWrapped(wrapped) {
  return wrapped.__isWrapped;
}

export function error(message, params) {
  return { type: "error", ...params, message };
}

export function skip(message, params) {
  return { type: "skip", ...params, message };
}

export function ret(value, params) {
  return { type: "return", ...params, value }
}
