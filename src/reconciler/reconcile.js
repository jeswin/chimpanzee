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
  isTraversingDependent: boolean,
  [immediateChildTasks, deferredChildTasks]: [Array<TaskType>, Array<TaskType>],
  mergeChildTasks,
  meta: MetaType
) {
  immediateChildTasks = immediateChildTasks || [];
  deferredChildTasks = deferredChildTasks || [];

  return function(
    obj: any,
    context: ContextType,
    key: string,
    parents: Array<any>,
    parentKeys: Array<string>
  ) {
    function mergeTasks(finished) {
      return Seq.of(finished).reduce(
        (acc, { result, params }) => {
          return result instanceof Match
            ? !(result instanceof Empty)
                ? Object.assign(acc, { state: result.value })
                : acc
            : { nonMatch: result };
        },
        context,
        (acc, { result }) => !(result instanceof Match)
      );
    }

    function getTask(builder) {
      const task = function fn() {
        const readyToRun =
          !builder.precondition ||
          builder.precondition(obj, context, key, parents, parentKeys);
        return readyToRun
          ? (() => {
              const predicates = !builder.predicates
                ? []
                : builder.predicates.map(p => ({
                    fn: p.predicate,
                    invalid: () =>
                      new Skip(
                        p.message || `Predicate returned false.`,
                        { obj, context, key, parents, parentKeys },
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
                        { obj, context, key, parents, parentKeys },
                        meta
                      )
                  }));

              return (
                Seq.of(predicates.concat(assertions))
                  .map(
                    predicate =>
                      (predicate.fn(obj, context, key, parents, parentKeys)
                        ? undefined
                        : predicate.invalid())
                  )
                  .first(x => x) ||
                (() => {
                  const result = builder.get(
                    obj,
                    context,
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
                        { obj, context, key, parents, parentKeys },
                        meta
                      );
                })()
              );
            })()
          : fn;
      };
      return { task };
    }

    function run(tasksList) {
      const [[tasks, merge], ...rest] = tasksList;

      const { finished, unfinished } = Seq.of(tasks).reduce(
        (acc, { task, params }) =>
          (typeof task === "function"
            ? {
                finished: acc.finished,
                unfinished: acc.unfinished.concat({ task: task(), params })
              }
            : {
                finished: acc.finished.concat({ result: task, params }),
                unfinished: acc.unfinished
              }),
        { finished: [], unfinished: [] }
      );

      const { state, nonMatch } = finished.length ? merge(finished) : {};

      return nonMatch
        ? nonMatch
        : unfinished.length
            ? () => run([[unfinished, merge], ...rest])
            : rest.length
                ? () => run(rest)
                : isTraversingDependent || typeof state === "undefined"
                    ? new Empty(
                        { obj, context, key, parents, parentKeys },
                        meta
                      )
                    : new Match(
                        state,
                        { obj, context, key, parents, parentKeys },
                        meta
                      );
    }

    const mustRun = !params.predicate || params.predicate(obj);

    return !mustRun
      ? new Skip(
          `Predicate returned false.`,
          { obj, context, key, parents, parentKeys },
          meta
        )
      : () => {
          const tasks = Seq.of(params.builders)
            .map(builder => getTask(builder))
            .toArray();

          const allTasks = [
            [immediateChildTasks, mergeChildTasks],
            [deferredChildTasks, mergeChildTasks],
            [tasks, mergeTasks]
          ];

          return run(allTasks);
        };
  };
}
