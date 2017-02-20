// import { wrap, unwrap, skip } from "./wrap";
// import { match } from "./chimpanzee";
// import { waitFor, pipe } from "./utils";
//
// export function repeating(gen, { min, max }) {
//   return wrap(gen, { type: "repeating", min, max })
// }
//
// export function unordered(gen) {
//   return wrap(gen, { type: "unordered" })
// }
//
// function _unwrap(something) {
//   return isWrapped(something)
//     ? { type: something.type, item: unwrap(something) }
//     : { item: something }
// }
//
// function assertNeedle(needle, op) {
//   return typeof needle === "undefined"
//     ? { error: error(`Needle missing. Did you call ${op}() outside an array() function?`) }
//     : undefined
// }
//
// /*
//   Unordered does not change the needle.
//   Searching for "1" in
//   [1, 4, 4, 4, 4, 5, 6, 67]
//             ^needle
//   returns [4, 4], with needle moved to 5.
// */
// export function repeatingItem(gen, { min, max }) {
//   return async function(obj, context, key, needle) {
//     return await pipe(
//       assertNeedle(needle, "repeating"),
//       async res =>
//         res
//           ? res
//           : await Seq.of(obj)
//             .slice(needle)
//             .reduce(async (acc, item, i) => {
//               const results = typeof gen === "function"
//                 ? await gen(obj, context, key, needle)
//                 : regular()
//               return {}
//             });
//       )
//     )
//
//     assertNeedle(needle, "repeating") ||
//       await
//
//     return result.error
//       ? result
//       : {
//         value: result.value,
//         needle: result.needle
//       }
//   }
// }
//
// /*
//   Unordered does not change the needle.
//   Searching for "1" in
//   [1, 2, 4, 5, 6, 67]
//          ^needle
//   returns 1, with needle still pointing at 4.
// */
// export function unorderedItem(item) {
//   return async function(obj, context, key, params, needle) {
//     return await waitFor(
//       typeof gen === "function"
//         ? await gen(obj, context, key)
//         : await traverse(gen)(obj, context, key),
//     )
//     const results = await pipe(
//       assertNeedle(needle, "repeating") ||
//       await Seq.of(obj)
//         .map(async i =>
//           await waitFor()
//           )
//         .reduce(async (acc, item, i) => {
//           const results = typeof gen === "function"
//           ? await gen(obj, context, key, needle)
//           : regular()
//           return {}
//         })
//
//     )
//
//
//     return result.error
//       ? result
//       : {
//         value: result.value,
//         needle: needle
//       };
//   }
// }
//
//
// /*
//   Matches if the list contains an item or not.
//   Search for 2 works in
//     [1, 2, 3] and [1, 4, 5, 6].
//   Needle is incremented if the item is found.
// */
// export function optionalItem(item) {
//   return async function(obj, context, key, params, needle) {
//     return await waitFor(
//       typeof gen === "function"
//         ? await gen(obj, context, key)
//         : await traverse(gen)(obj, context, key),
//       result =>
//         result.type === "return"
//           ? {
//             items: result.value,
//             needle: needle + 1
//           }
//           : x
//     );
//   }
// }
//
//
// /*
//   Regular array item. Not repeating or unordered.
// */
// function regular(schema) {
//   return async function(obj, context, key, needle) {
//     return await waitFor(
//       typeof schema === "function"
//         ? await schema(obj[needle], context, key)
//         : await traverse(schema)(obj[needle], context, key),
//       result =>
//         result.type === "return"
//           ? {
//             items: result.value,
//             needle: needle + 1
//           }
//           : x
//     );
//   }
// }
//
//
//
// function traverseItem(_schema) {
//   const { isWrapper, params, schema } = unwrap(_schema);
//   return async function(obj, context, key, items, needle) {
//     return isWrapper
//       // This is a wrapper.
//       // So, either repeating() or unordered()
//       ? await pipe(
//         await schema(obj, context, key, params, needle),
//         x => ({
//           items,
//           needle
//         })
//       )
//       //This is not a wrapped function.
//       // Generic, like an object schema or an optional() schema
//       : await regular(schema)(
//         obj,
//         context,
//         key,
//         needle
//       )
//   }
// }
//
// /*
//   You'd call this like
// */
// export function array(list) {
//   return async function(obj, context, key) {
//     return Array.isArray(obj)
//       ? (await (async run(gens, results, needle) =>
//           await waitFor(
//             await traverseItem(gens[0])(obj, context, key, results, needle),
//             result =>
//               ["skip", "error"].includes(result.type)
//                 ? result
//                 : gens.length > 1
//                   ? (await run(
//                     results.concat([result.value]),
//                     gens.slice(1),
//                     result.needle
//                   ))
//                   : ret(results.concat([result.value]))
//           )
//       )(list, [], 0))
//       : error(`Expected array but got ${typeof obj}.`)
//   }
// }
