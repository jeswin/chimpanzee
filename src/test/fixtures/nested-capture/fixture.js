import { traverse, capture } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello",
    other1: "something1",
    level2: {
      prop2: "world"
    }
  }
}

// export const schema = traverse({
//   level1: {
//     prop1: capture(),
//     level2: {
//       prop2: capture()
//     }
//   }
// })

export const schema = traverse({
  level1: {
    prop1: capture("prop1", {}, { name: "P1"}),
    level2: {
      prop2: capture("prop2", {}, {name: "P2"})
    }
  }
}, { "name": "ROOT" })
