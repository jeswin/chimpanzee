import { traverse, func } from "../../../chimpanzee";

export const input = {
  hello: "world"
}

export const schema = traverse({
  hello: func()
})
