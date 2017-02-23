import { traverse, deep, capture } from "../../../chimpanzee";

export const input = {
  level1: {
    prop1: "hello",
    level2: {
      level3: {
        prop2: "something"
      }
    },
    level2a: {
      level3a: {
        level4a: {
          level5a: {
            prop3: "world"
          }
        },
        level4b: "yoyo"
      }
    }
  }
}

export const schema = traverse({
  level1: {
    level2a: deep(traverse({
      level5a: {
        prop3: capture()
      }
    }), "prop1")
  }
})
