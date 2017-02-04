import { traverse } from "./traverse";

export function capture(name, schema) {
  return function*(obj, state, key) {
    const genFn = traverse(
      schema || {},
      {
        result: (state, obj) => ({ [name || key]: obj })
      }
    );
    return yield* genFn(obj, state, key);
  }
}

//
// export function captureIf(predicate, name, schema) {
//   return traverse(
//     schema || {},
//     {
//       predicate,
//       result: (state, obj) => ({ [name]: obj })
//     }
//   )
// }
