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
  MergeResultType,
} from "../types";

export default function(
  params: SchemaParamsType,
  [immediateChildTasks, deferredChildTasks]: [Array<TaskType>, Array<TaskType>],
  mergeChildResult: (finished: any, context: ContextType) => MergeResultType,
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

    type TaskReduceResultType = {
      pending: Array<TaskType>,
      result: MergeResultType
    };

    function run(tasksList, currentContext: ContextType) {
      const [[tasks, merge], ...rest] = tasksList;

      const { pending, result }: TaskReduceResultType = Seq.of(tasks).reduce(
        (acc: TaskReduceResultType, { task, type, params }) =>
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
        (acc: TaskReduceResultType) => typeof acc.result.nonMatch !== "undefined"
      );

      const { context, nonMatch } = result;

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
      ? (context: ContextType) =>
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
