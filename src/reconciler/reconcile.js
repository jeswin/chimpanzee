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
    function mergeResult(finished, state) {
      const { result, params } = finished;
      return result instanceof Match
        ? !(result instanceof Empty) ? { state: result.value } : { state }
        : { nonMatch: result };
    }

    function getTask(builder) {
      const task = function fn(state) {
        const readyToRun =
          !builder.precondition ||
          builder.precondition(obj, key, parents, parentKeys);
        return readyToRun
          ? (() => {
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
                      new Fault(
                        a.error,
                        { obj, key, parents, parentKeys },
                        meta
                      )
                  }));

              return (
                Seq.of(predicates.concat(assertions))
                  .map(
                    predicate =>
                      (predicate.fn(
                        obj,
                        { ...context, state },
                        key,
                        parents,
                        parentKeys
                      )
                        ? undefined
                        : predicate.invalid())
                  )
                  .first(x => typeof x !== "undefined") ||
                (() => {
                  const result = builder.get(
                    obj,
                    { ...context, state },
                    key,
                    parents,
                    parentKeys
                  );
                  return [Match, Skip, Fault].some(
                    resultType => result instanceof resultType
                  )
                    ? result
                    : new Match(
                        result,
                        { obj, key, parents, parentKeys },
                        meta
                      );
                })()
              );
            })()
          : fn;
      };
      return { task, type: "reconcile" };
    }

    function run(tasksList, currentState) {
      const [[tasks, merge], ...rest] = tasksList;

      const { pending, result } = Seq.of(tasks).reduce(
        (acc, { task, type, params }) =>
          (typeof task === "function"
            ? {
                pending: acc.pending.concat({
                  task: task(acc.result.state),
                  type,
                  params
                }),
                result: acc.result
              }
            : {
                pending: acc.pending,
                result: merge({ result: task, params }, acc.result.state)
              }),
        {
          pending: [],
          result: { state: currentState, nonMatch: undefined }
        },
        (acc, item) => typeof acc.result.nonMatch !== "undefined"
      );

      const { state, nonMatch } = result;

      debugger;
      return nonMatch
        ? nonMatch
        : pending.length
            ? () => run([[pending, merge], ...rest], state)
            : rest.length
                ? () => run(rest, state)
                : typeof state === "undefined"
                    ? new Empty(
                        { obj, key, parents, parentKeys },
                        meta
                      )
                    : new Match(
                        state,
                        {
                          obj,
                          context: { ...context, state },
                          key,
                          parents,
                          parentKeys
                        },
                        meta
                      );
    }

    const mustRun = !params.predicate || params.predicate(obj);

    return !mustRun
      ? new Skip(
          `Predicate returned false.`,
          { obj, key, parents, parentKeys },
          meta
        )
      : () => {
          const tasks = Seq.of(params.builders)
            .map(builder => getTask(builder))
            .toArray();

          const allTasks = [
            [immediateChildTasks, mergeChildResult],
            [deferredChildTasks, mergeChildResult],
            [tasks, mergeResult]
          ];

          return run(allTasks, context.state);
        };
  };
}
