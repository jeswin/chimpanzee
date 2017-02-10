export function error(message) {
  return { type: "error", message };
}

export function skip(message) {
  return { type: "skip", message };
}

export function ret(value) {
  return { type: "return", value }
}
