/* @flow */
import { Seq } from "lazily";
import { Match, Empty, Skip, Fault } from "../results";
import Schema from "../schema";

import type {
  ContextType,
  SchemaType,
  RawSchemaParamsType,
  SchemaParamsType,
  ResultGeneratorType,
  EnvType,
  MetaType
} from "../types";

import type { TaskType } from "../traverse";

export default function(
  params: SchemaParamsType,
  [immediateChildTasks, deferredChildTasks]: [Array<TaskType>, Array<TaskType>],
  mergeChildResult,
  meta: MetaType
) {
  immediateChildTasks = immediateChildTasks || [];
  deferredChildTasks = deferredChildTasks || [];

  return function(
    obj: any,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    function mergeResult(finished, context) {
      const { result, params } = finished;
      return result instanceof Match
        ? !(result instanceof Empty)
            ? { context: { ...context, state: result.value } }
            : { context }
        : { nonMatch: result };
    }

    function getTask(builder) {
      function task(context) {
        const predicates = !builder.predicates
          ? []
          : builder.predicates.map(p => ({
              fn: p.predicate,
              invalid: () =>
                new Skip(
                  p.message || `Predicate returned false.`,
                  { obj, key, parents, parentKeys },
                  meta
                )
            }));

        const assertions = !builder.asserts
          ? []
          : builder.asserts.map(a => ({
              fn: a.predicate,
              invalid: () =>
                new Fault(a.error, { obj, key, parents, parentKeys }, meta)
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
            const result = builder.get(obj, key, parents, parentKeys)(context);
            return [Match, Skip, Fault].some(
              resultType => result instanceof resultType
            )
              ? result
              : new Match(result, { obj, key, parents, parentKeys }, meta);
          })()
        );
      }
      return { task, type: "reconcile" };
    }

    function run(tasksList, currentContext) {
      const [[tasks, merge], ...rest] = tasksList;

      const { pending, result } = Seq.of(tasks).reduce(
        (acc, { task, type, params }) =>
          (() => {
            if (acc.result.context === undefined) {
              debugger;
            }
            if (
              typeof task !== "function" &&
              merge({ result: task, params }, acc.result.context).context ===
                undefined
            ) {
              debugger;
            }
          })() ||
          (typeof task === "function"
            ? {
                pending: acc.pending.concat({
                  task: task(acc.result.context),
                  type,
                  params
                }),
                result: acc.result
              }
            : {
                pending: acc.pending,
                result: merge({ result: task, params }, acc.result.context)
              }),
        {
          pending: [],
          result: { context: currentContext }
        },
        (acc, item) => typeof acc.result.nonMatch !== "undefined"
      );

      const { context, nonMatch } = result;

      //debugger;

      return nonMatch
        ? nonMatch
        : pending.length
            ? () => run([[pending, merge], ...rest], context)
            : rest.length
                ? () => run(rest, context)
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

    const mustRun = !params.predicate || params.predicate(obj);

    return !mustRun
      ? context =>
          new Skip(
            `Predicate returned false.`,
            { obj, key, parents, parentKeys },
            meta
          )
      : (context: any) => {
          const tasks = Seq.of(params.builders)
            .map(builder => getTask(builder))
            .toArray();

          const allTasks = [
            [immediateChildTasks, mergeChildResult],
            [deferredChildTasks, mergeChildResult],
            [tasks, mergeResult]
          ];

          return run(allTasks, context);
        };
  };
}
