import { IParams } from "../types";

export function getParams(params?: string | IParams): IParams {
  return typeof params === "string"
    ? { key: params }
    : typeof params === "undefined"
    ? {}
    : params;
}
