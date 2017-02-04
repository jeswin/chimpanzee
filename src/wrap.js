export function wait() {
  return { type: "wait" };
}

export function error(message) {
  return { type: "error", message };
}

export function skip() {
  return { type: "skip" }
}

export function ret(value) {
  return { type: "return", value }
}
