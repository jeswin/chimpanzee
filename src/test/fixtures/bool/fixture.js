import { traverse, bool } from "../../../chimpanzee";

export const input = {
  hello: true
}

export const schema = traverse({
  hello: bool()
})
