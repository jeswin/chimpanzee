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
//   if (isWrapped(something)) {
//     return { type: something.type, item: unwrap(something) }
//   } else {
//     return { item: something }
//   }
// }
//
// export function array(list) {
//   return async function(obj, context, key) {
//
//     function getMatcher() {
//       const { type, item } = _unwrap(_gen);
//       if (type === "unordered") {
//         const { type: type2, item: item2 } = _unwrap(item);
//         if (type2 === "repeating") {
//           const match = findUnorderedRepeating(item2, type2.min, type2.max, needle)
//         }
//         else if (type2) {
//           throw new Error(`Unordered array item can only be repeating or non-repeating. Got ${type2}.`)
//         }
//         else {
//           const match = findUnordered();
//         }
//       } else if (type === "repeating") {
//         const { type: type2, item: item2 } = _unwrap(item);
//         if (type2 === "optional") {
//           const match = findrepeatingOptional();
//         }
//         else if (type2) {
//           throw new Error(`Repeating array item can only be optional or mandatory. Got ${type2}.`)
//         }
//         else {
//           const match = findRepeating();
//         }
//       }
//       else if (type === "optional") {
//         const match = findOptional();
//       }
//       else {
//         const match = findItem();
//       }
//     }
//
//     function async findUnordered(gen, needle) {
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
