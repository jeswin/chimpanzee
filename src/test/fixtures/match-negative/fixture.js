import { traverse, capture } from "../../../chimpanzee";

export const input = {
  level2a: {
    level3a: {
      level4a: {
        level5a: {
          prop3: "world"
        }
      }
    }
  }
}

export const schema = traverse({
  level2a: {
    level5a: {
      prop3: capture()
    }
  }
})
