export function wait() {
  return { type: "wait" };
}

export function error(message) {
  return { type: "skip", message };
}

export function skip(message) {
  return { type: "skip", message };
}

export function ret(value) {
  return { type: "return", value }
}