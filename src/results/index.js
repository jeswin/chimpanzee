/* @flow */
import Match from "./match";
import Empty from "./empty";
import Fault from "./fault";
import Skip from "./skip";

export { default as Match } from "./match";
export { default as Empty } from "./empty";
export { default as Fault } from "./fault";
export { default as Skip } from "./skip";

export type ResultType = Match | Empty | Fault | Skip;
