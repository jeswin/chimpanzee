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
            ? !(result instanceof Empty) ? { ...acc, state: result.value } : acc
            : { nonMatch: result };
        },
        context,
        (acc, { result }) => !(result instanceof Match)
      );
    }

    function getTask(builder) {
      const task = function fn(state) {
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
                      (predicate.fn(obj, { ...context, state }, key, parents, parentKeys)
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

    function run(tasksList, mainState) {
      const [[tasks, merge], ...rest] = tasksList;

      const { finished, unfinished } = Seq.of(tasks).reduce(
        (acc, { task, params }) =>
          (typeof task === "function"
            ? {
                finished: acc.finished,
                unfinished: acc.unfinished.concat({
                  task: task(mainState),
                  params
                })
              }
            : {
                finished: acc.finished.concat({ result: task, params }),
                unfinished: acc.unfinished
              }),
        { finished: [], unfinished: [] }
      );

      console.log("MAINSTATE", mainState);

      const { state, nonMatch } = finished.length
        ? merge(finished, mainState)
        : { state: mainState };

      console.log(
        "\n\nRUN",
        "....",
        finished,
        state,
        "/",
        nonMatch,
        finished.length,
        unfinished.length,
        "...",
        rest.length,
        "\n\n"
      );

      return nonMatch
        ? nonMatch
        : unfinished.length
            ? () => run([[unfinished, merge], ...rest], state)
            : rest.length
                ? () => run(rest, state)
                : typeof state === "undefined"
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

          return run(allTasks, context.state);
        };
  };
}
