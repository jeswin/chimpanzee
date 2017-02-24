// import { wrap, unwrap, skip, ret, isWrapped, getType } from "./wrap";
// import { traverse } from "./traverse";
// import { waitForSchema, pipe } from "./utils";
//
// /*
//   Unordered does not change the needle.
//   Searching for "1" in
//   [1, 4, 4, 4, 4, 5, 6, 67]
//             ^needle
//   returns [4, 4], with needle moved to 5.
// */
// export function repeating(_schema, { min, max }) {
//   return wrap(function(needle) {
//     const schema = createArraySchema(_schema, needle);
//     return function(obj, context, key) {
//       const matches = Seq.of(obj.slice(needle))
//         .reduce((acc, item) =>
//           waitForSchema(
//             schema,
//             items[0],
//             context,
//             key,
//             result =>
//               result instanceof Result
//                 ? acc.concat(result.value)
//                 : result
//           ),
//           [],
//           (acc, item) => item.type !== "return"
//         )
//       return (max && matches.length <= max)  || (min && matches.length >= min)
//           ? ret(matches, { needle: needle + matches.length })
//           : skip("Incorrect number of matches");
//     }
//   })
// }
//
// /*
//   Unordered does not change the needle.
//   Searching for "1" in
//   [1, 2, 4, 5, 6, 67]
//          ^needle
//   returns 1, with needle still pointing at 4.
//   We don't care about the needle.
// */
// export function unordered(_schema) {
//   return wrap(function(needle) {
//     const schema = createArraySchema(_schema, needle);
//     return function(obj, context, key) {
//       return (function run(items) {
//         return items.length
//           ? waitForSchema(
//             schema,
//             items[0],
//             context,
//             key,
//             result =>
//               result instanceof Result
//                 ? ret(result.value, { needle })
//                 : run(items.slice(1))
//           )
//           : skip("Unordered item was not found.")
//       })(obj);
//     }
//   })
// }
//
//
// /*
//   Not array types, viz optional, unordered or repeating.
// */
// function regularItem(schema) {
//   const _schema = typeof schema === "function"
//     ? schema
//     : traverse(schema);
//   return needle =>
//     (obj, context, key) => console.log(">>1", context, needle, obj[needle]) ||
//       ret((_schema(obj[needle], context, key)).value, { needle: needle + 1 });
// }
//
//
// function createArraySchema(schema, needle) {
//   return isWrapped(schema)
//     ? unwrap(schema)(needle)
//     : regularItem(schema)(needle)
// }
//
// /*
//   You'd call this like
// */
// export function array(list, name) {
//   return function(obj, context, key) {
//     return Array.isArray(obj)
//       ? ((function run(schemas, results, needle) {
//         waitForSchema(
//           createArraySchema(schemas[0], needle),
//           obj,
//           context,
//           `${key}_${needle}`,
//           result => console.log("?RES", schemas.length, result) ||
//             ["skip", "error"].includes(result.type)
//               ? result
//               : schemas.length > 1
//                 ? (run(
//                   schemas.slice(1),
//                   results.concat([result.value]),
//                   result.needle
//                 ))
//                 : true //console.log("RES", { [name || key]: results.map(i => ) }) || ret(results.concat([result.value]))
//         )
//       })(list, [], 0))
//       : error(`Expected array but got ${typeof obj}.`)
//   }
// }
