// import { wrap, unwrap, skip } from "./wrap";
// import { match } from "./chimpanzee";
//
// export function repeating(gen, { min, max }) {
//   return wrap(gen, { type: "repeating", min, max })
// }
//
// export function unordered(gen) {
//   return wrap(gen, { type: "unordered" })
// }
//
// export function optional(gen) {
//   return wrap(gen, { type: "optional" })
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
//     ? {
//       error: error(`Needle missing. Did you call ${op}() outside an array() function?`)
//     }
//     : undefined
//   }
// }
//
// /*
//   Unordered does not change the needle.
//   Searching for "4" in
//   [1, 2, 3, 4, 5, 6, 67]
//             ^needle
//   returns 4, with needle moved to 5.
//
//   If not found, skip() is not returned.
//   ie, it is optional.
// */
// export function optional(gen) {
//   return async function(obj, context, key, needle) {
//     const result = assertNeedle(needle, "optional") ||
//       typeof gen === "function"
//         ? await gen(obj, context, key, needle)
//         : regular(obj, context, key, needle);
//
//     return result.error
//       ? result
//       : result.skip
//         ? {
//           value: [],
//           needle
//         }
//         : {
//           value: result.value,
//           needle: result.needle
//         }
//   }
// }
//
// /*
//   Unordered does not change the needle.
//   Searching for "1" in
//   [1, 4, 4, 4, 4, 5, 6, 67]
//             ^needle
//   returns [4, 4], with needle moved to 5.
// */
// export function repeating(gen) {
//   return async function(obj, context, key, needle) {
//     const results = assertNeedle(needle, "repeating") ||
//       await Seq.of(obj)
//         .slice(needle)
//         .reduce(async (acc, item, i) => {
//           const results = typeof gen === "function"
//             ? await gen(obj, context, key, needle)
//             : regular()
//           return {}
//         });
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
// export function unordered(item) {
//   return async function(obj, context, key, needle) {
//     const results = await Seq.of(obj)
//       .reduce(async (acc, item, i) => {
//         const results = typeof gen === "function"
//           ? await gen(obj, context, key, needle)
//           : regular()
//         return {}
//       })
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
// /*
//   Regular item, not a function. Like an object or a number.
// */
// export async function regular(schema, obj, context, key, needle) {
//   return {
//     value: [await match(traverse(schema, undefined, false)(obj, context, key))],
//     needle: needle + 1
//   }
// }
//
// /*
//   You'd call this like
// */
// export function array(list) {
//   return async function(obj, context, key) {
//     return !Array.isArray(obj)
//       ? (x => x.error || ret(x.results))(await Seq.of(list)
//           .reduce((acc, gen, i) =>
//             typeof gen === "function"
//               ? (x => ({ results: acc.results.concat([x.result]), error: x.error, needle: x.needle }))(await gen(obj, context, key, acc.needle))
//               : {
//                   results: await regular(gen, obj[acc.needle], context, `${key}_${i}`),
//                   needle: acc.needle + 1
//               },
//             { results: [], needle: 0 },
//             (acc, item) => item.error //breaks if true
//           )
//         )
//       : error(`Expected array but got ${typeof obj}.`)
//   }
// }
