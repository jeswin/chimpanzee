import { traverse, Match } from "../../../chimpanzee";

export const input = {
  hello: "world"
}

export const schema = traverse({
  hello: item => new Match(`${item}!!!`)
})
