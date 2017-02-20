// import { wrap, unwrap, skip } from "./wrap";
// import { match } from "./chimpanzee";
// import { waitForSchema, pipe } from "./utils";
//
// /*
//   Unordered does not change the needle.
//   Searching for "1" in
//   [1, 4, 4, 4, 4, 5, 6, 67]
//             ^needle
//   returns [4, 4], with needle moved to 5.
// */
// export function repeatingItem(_schema, { min, max }) {
//   return wrap(function(needle) {
//     const schema = createArraySchema(_schema, needle);
//     return async function(obj, context, key) {
//       return await (async function run(items) {
//         return items.length
//           ? await waitForSchema(
//             schema,
//             items[0],
//             context,
//             key,
//             async result =>
//               result.type === "return"
//                 ? ret(result.value, { needle })
//                 : await run(items.slice(1))
//           )
//           : skip("Unordered item was not found.")
//       })(obj);
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
// export function unorderedItem(_schema) {
//   return wrap(function(needle) {
//     const schema = createArraySchema(_schema, needle);
//     return async function(obj, context, key) {
//       return await (async function run(items) {
//         return items.length
//           ? await waitForSchema(
//             schema,
//             items[0],
//             context,
//             key,
//             async result =>
//               result.type === "return"
//                 ? ret(result.value, { needle })
//                 : await run(items.slice(1))
//           )
//           : skip("Unordered item was not found.")
//       })(obj);
//     }
//   })
// }
//
//
// /*
//   Matches if the list contains an item or not.
//   Search for 2 works in
//     [1, 2, 3] and [1, 4, 5, 6].
//   Needle is incremented if the item is found.
// */
// export function optionalItem(schema) {
//   return wrap(needle =>
//     async (obj, context, key) =>
//       createArraySchema(schema, needle);
//   );
// }
//
//
// /*
//   Not array types, viz optional, unordered or repeating.
// */
// function regularItem(_schema) {
//   const schema = typeof _schema === "function"
//     ? schema
//     : traverse(_schema);
//   return needle =>
//     async (obj, context, key) =>
//       await schema(obj[needle], context, key);
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
// export function array(list) {
//   return async function(obj, context, key) {
//     return Array.isArray(obj)
//       ? (await (async run(schemas, results, needle) =>
//         await waitForSchema(
//           createArraySchema(schemas[0], needle),
//           obj,
//           context,
//           key,
//           async result =>
//             ["skip", "error"].includes(result.type)
//               ? result
//               : schemas.length > 1
//                 ? (await run(
//                   results.concat([result.value]),
//                   schemas.slice(1),
//                   result.needle
//                 ))
//                 : ret(results.concat([result.value]))
//         )
//       )(list, [], 0))
//       : error(`Expected array but got ${typeof obj}.`)
//   }
// }
