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
// export function optional(item) {
//   return async function(obj, context, key, needle) {
//     return typeof item === "function"
//       ? true
//       : regular()
//   }
// }
//
// export function repeating(item) {
//
// }
//
// export function unordered(item) {
//
// }
//
// export async function regular(schema, obj, context, key) {
//   return await traverse(schema, undefined, false)(obj, context, key)
// }
//
// export function array(list) {
//   return async function(obj, context, key) {
//     return !Array.isArray(obj)
//       ? (x => x.error || ret(x.results))(await Seq.of(list)
//           .reduce((acc, gen, i) =>
//             typeof gen === "function"
//               ? (x => ({ results: acc.results.concat(x.result), error: x.error, needle: x.needle }))(await gen(obj, context, key, acc.needle))
//               : {
//                   results: await regular(gen, obj[acc.needle], context, `${key}_${i}`),
//                   needle: acc.needle + 1
//                 },
//             { results: [], needle: 0 },
//             (acc, item) => item.error //breaks if true
//           )
//         )
//       : error(`Expected array but got ${typeof obj}.`)
//   }
// }
//
//
//
//   function async findUnordered() {
//     const { type, item } = _unwrap(item);
//
//     return type === "repeating"
//       ? options.concat(type, item, type.min, type.max, needle)
//       : type === "optional"
//         ? options.concat()
//         : type
//           ? error(`Unordered array item can only be repeating or non-repeating. Got ${type2}.`)
//           : await findJustUnordered()
//   }
//
//   function async findRepeating() {
//     const { type, item } = _unwrap(item);
//
//     return type === "optional"
//       ? await findRepeatingOptional()
//       : type === "repeating"
//
//
//         ? error(`Repeating array item can only be optional or mandatory. Got ${type}.`)
//         : await findJustRepeating();
//
//       }
//       else if (type) {
//         error(``)
//       }
//       else {
//         const match = findRepeating();
//       }
//   }
//
//
//
//   return async function(obj, context, key) {
//
//     function getMatcher() {
//       const { type, item } = _unwrap(_gen);
//
//
//
//
//   function async findJustUnordered(gen, needle) {
//       for (const item of obj) {
//         const result = await match(gen(item, context, key));
//         if (result && result.type === "return") {
//           return { result: result.value, needle }
//         }
//       }
//       return { skip: "Unordered item not found" }
//     }
//
//     function async findUnorderedRepeating(gen, min, max, needle) {
//       const results = [];
//       for (const item of obj) {
//         const result = await match(gen(item, context, key));
//         if (result && result.type === "return") {
//           results.push(result.value)
//         }
//       }
//
//
//
//       return ((!min || results.length >= min) && (!max || results.length <= max)) ?
//         { result: results, needle } : { skip: "Unordered item not found" };
//     }
//
//     function async findRepeating(gen, min, max, needle) {
//       for (const i = needle; i++; i < obj.length) {
//         const item = obj[i];
//         const result = await match(gen(item, context, key));
//         if (result && result.type === "return") {
//           results.push(result.value)
//         } else {
//
//         }
//       }
//     }
//
//     function async findrepeatingOptional() {
//
//     }
//
//     function async findOptional() {
//
//     }
//
//     function async findItem() {
//
//     }
//
//     if (Array.isArray(obj)) {
//       const results = [];
//
//       let arrayNeedle = 0;
//       for (const _gen of list) {
//         const { matcher } = getMatcher(_gen);
//
//       }
//
//     }
//     else {
//       return skip("Not an array.")
//     }
//   }
// }
