export function getParams(params) {
  return typeof params === "string" ? { key: params } : params;
}
