import { composite, capture } from "../../../chimpanzee";

export const input = {
  node: {
    level1: {
      something: "else",
      node: {
        level2: {
          node: { hello: "world" }
        }
      }
    }
  },
  prop: "something"
};

export const schema = composite(
  {
    level1: {
      something: capture(),
      level2: {
        hello: capture({ selector: "alt" })
      }
    }
  },
  [
    { name: "default", modifiers: { object: obj => obj.node } },
    {
      name: "alt",
      modifiers: { property: (obj, key) => obj.node[key] }
    }
  ]
);
