import { traverse, number } from "../../../chimpanzee";

export const input = {
  hello: 9
}

export const schema = traverse({
  hello: number()
})
