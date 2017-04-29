/* @flow */
import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  RawSchemaParamsType,
  SchemaParamsType,
  TaskType,
  EnvType,
  MetaType,
  MergeResultType
} from "../types";

export default function(params: SchemaParamsType, tasks: Array<TaskType>, meta: MetaType) {
  return function(obj: any, key: string, parents: Array<any>, parentKeys: Array<string>) {
    function mergeResult(finished, context) {
      const { result, params } = finished;
      return result instanceof Match
        ? !(result instanceof Empty)
            ? { context: { ...context, state: result.value } }
            : { context }
        : { nonMatch: result };
    }

    function defaultMerge(
      finished: { result: Result, params: SchemaParamsType },
      context: any
    ) {
      const { result, params } = finished;

      return result instanceof Match
        ? !(result instanceof Empty)
            ? { context: { ...context, state: result.value } }
            : { context }
        : { nonMatch: result };
    }

    function getTask() {
      function task(context) {
        const predicates = !params.predicates
          ? []
          : params.predicates.map(p => ({
              fn: p.predicate,
              invalid: () =>
                new Skip(
                  p.message || `Predicate returned false.`,
                  { obj, key, parents, parentKeys },
                  meta
                )
            }));

        const assertions = !params.asserts
          ? []
          : params.asserts.map(a => ({
              fn: a.predicate,
              invalid: () => new Fault(a.error, { obj, key, parents, parentKeys }, meta)
            }));

        return (
          Seq.of(predicates.concat(assertions))
            .map(
              predicate =>
                (predicate.fn(obj, key, parents, parentKeys)(context)
                  ? undefined
                  : predicate.invalid())
            )
            .first(x => typeof x !== "undefined") ||
          (() => {
            const result = params.build(obj, key, parents, parentKeys)(context);
            return [Match, Skip, Fault].some(resultType => result instanceof resultType)
              ? result
              : new Match(result, { obj, key, parents, parentKeys }, meta);
          })()
        );
      }
      return task;
    }

    global.ctr = global.ctr || 0;
    function run(tasks, currentContext: ContextType) {
      console.log(++ctr);
      if (ctr === 3) debugger;
      const { context, nonMatch } = Seq.of(tasks).reduce(
        (acc, { task, merge, params }) => {
          if (typeof task !== "function") {
            debugger;
          }
          const taskResult = task(acc.context);
          return (merge || defaultMerge)({ result: taskResult, params }, acc.context);
        },
        { context: currentContext },
        acc => typeof acc.nonMatch !== "undefined"
      );

      return nonMatch
        ? nonMatch
        : typeof context.state === "undefined"
            ? new Empty({ obj, key, parents, parentKeys }, meta)
            : new Match(
                context.state,
                {
                  obj,
                  key,
                  parents,
                  parentKeys
                },
                meta
              );
    }

    return context => {
      const mustRun = !params.predicate || params.predicate(obj);

      return !mustRun
        ? new Skip(`Predicate returned false.`, { obj, key, parents, parentKeys }, meta)
        : (() => {
            const allTasks = Seq.of(tasks).concat(Seq.of([
              {
                task: getTask(),
                merge: mergeResult
              }
            ]));

            return run(allTasks, context);
          })();
    };
  };
}
