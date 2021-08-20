import { IObject } from "../types.js";

export function isObject(obj: any) : obj is IObject {
  return typeof obj === "object" && obj.constructor === Object;
}
