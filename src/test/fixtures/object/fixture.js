import { traverse, object } from "../../../chimpanzee";

export const input = {
  hello: { world: "again" }
}

export const schema = traverse({
  hello: object()
})
