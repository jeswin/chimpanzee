import { IObject } from "../types";

export function isObject(obj: any) : obj is IObject {
  return typeof obj === "object" && obj.constructor === Object;
}
