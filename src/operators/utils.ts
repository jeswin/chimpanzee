import { IParams } from "../types";

export function getParams(params: IParams) {
  return typeof params === "string" ? { key: params } : params;
}
