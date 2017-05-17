chimpanzee
==========
Chimpanzee is a library with which you can write a "Schema" for traversing trees structures and capturing values of certain nodes.
This is especially useful for analyzing ASTs, which can be fairly large and complex. Schemas can be composed, allowing common structures to be abstracted out.

This is still work in progress. The first non-beta version will come out along with the release of the parent project (Isotropy).

Installation
------------
```
npm install chimpanzee
```

Getting Started
---------------
```
import { match, types, capture } from "chimpanzee";

const input = {
  hello: "world"
}

const schema = {
  hello: capture()
}

const result = match(schema, input);
//result is Match { value: { hello: "world" } }
```

### Result Types
The result of a match is one of four types.
  - Match
    - value: object
  - Skip
    - message: string
  - Fault
    - message: string
  - Empty (is a Match, but has no value)


### Simple evaluation
```
import { Match } from "chimpanzee";

const input = {
  hello: "world"
}

const schema = {
  hello: item => context => new Match(`${item}!!!`)
}

const result = match(schema, input);
//result is Match { value: { hello: "world!!!" } }
```


### Simple capturing: capture()
Allows you to capture the value of a node.
```
const input = {
  hello: "world"
}

const schema = {
  hello: capture()
}

const result = match(schema, input);
//result is Match { value: { hello: "world" } }
```

### Named capturing: capture(alias)
Capture the value of a node and assign a name to it.
```
const input = {
  hello: "world"
}

const schema = {
  hello: capture("prop1")
}

const result = match(schema, input);
//result is Match { value: { prop1: "world" } }
```

### Capture and modify: capture(predicate, modifier)
Capture the value of a node and assign a name to it.
```
const input = {
  hello: "world"
}

const schema = {
  hello: modify(
    x => x === "world",
    x => `${x}!!!`
  )
}

const result = match(schema, input);
//result is Match { value: { prop1: "world!!!" } }
```

### Mismatched Tree
```
const input = {
  hello: "world"
}

const schema = {
  something: "else",
  hello: capture()
}

const result = match(schema, input);
//result is Skip { message: "Expected something to be defined." }
```

### Capture with predicate: captureIf(predicate)
```
const input = {
  hello: "world"
}

const schema = {
  hello: captureIf(x => x === "world")
}

const result = match(schema, input);
//result is Match { value: { hello: "world" } }
```

### Capturing Types
```
const input = {
  name: "JPK",
  isHuman: true,
  age: 36,
  meta: { x: 100 },
  getCoordinates: () => "BLR"
}

const schema = {
  name: string(),
  isHuman: bool(),
  age: number(),
  meta: object(),
  getCoordinates: func()
}
```

### Capture a Literal
```
const input = {
  name: "JPK",
}

const schema = {
  name: literal("JPK"),
}
```

### Matching Arrays
```
const input = {
  myArray: [1, 2, 3]
}

const schema = { myArray: [number(), number(), number()] };
```

### Array with repeating nodes
```
const input = {
  level1: [
    "one",
    "two",
    "three"
  ]
}

const schema = {
  level1: array([
    repeatingItem(string())
  ])
};
```


### Array with unordered nodes
```
const input = {
  level1: [
    "one",
    "two",
    true
  ]
}

const schema = {
  level1: array([
    unorderedItem(string()),
    unorderedItem(bool())
  ])
};
```


### Array with optional nodes
```
const input = {
  level1: [
    20,
    "HELLO",
    true,
    100
  ]
}

const schema = {
  level1: array([
    optionalItem(number()),
    string(),
    bool()
  ])
};

```

### Optional
Matches if found. Does not emit a Skip() if not found.
```
const input = {
  level1: {
    prop1: "hello",
  }
}

const schema = {
  level1: {
    prop1: capture(),
    prop2: optional(capture())
  }
};
```

### Nested
```
const input = {
  inner1: {
   hello: "world"
  }
}

const schema = {
  prop1: "HELLO"
  inner1: {
    hello: capture()
   }
}

const result = match(schema, input);
//result is Match { value: { inner1: { hello: "world" } } }
```

### Merging with Parent (replace flag)
```

const input = {
  inner1: {
   hello: "world"
  }
}

const schema = types.obj(
  {
    inner1: {
      hello: capture()
     }
  },
  { replace: true }
)

const result = match(schema, input);
//result is Match { value: { hello: "world" } }
```

### Capturing and traversing Child Schema (Parent-Child)
```
const input = {
  level1: {
    level2: "hello world"
  }
}

const schema = {
  level1: captureAndParse(
    {
      level2: capture("prop2")
    },
    "prop1"
  )
}

const result = match(schema, input);
//result is Match { prop1: { level2: 'hello world', prop2: 'hello world' } }
```

### Matching Any Schema: any(list)
```
const input = {
  level1: {
    level2: "world"
  }
}

schema1 = {
  level4: capture("hello")
}

schema2 = {
  level1: {
    level2: capture("hello")
  }
};

const schema = any([schema1, schema2]);
```

### Matching nodes deeper in the tree: deep(schema)
```
const input = {
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

const schema = {
  level1: {
    level2a: deep(
      {
        level5a: {
          prop3: capture()
        }
      },
      "prop1"
    )
  }
}

const result = match(schema, input);
//result is Match { prop1: { prop3: 'world' } }
```

### Matching undefined or empty: empty()
```
const input = {
  prop1: "hello",
  prop2: undefined
}

const schema = {
  prop1: capture(),
  prop2: empty()
}

const result = match(schema, input);
//result is Match({ prop1: "hello" })
```

### Matching the existence of a node: exists()
```
export const input = {
  hello: "world",
  prop1: "val1"
}

export const schema = {
  hello: exists(),
  prop1: capture()
}

//This makes sure that hello exists. Or it returns a Skip.
```

### Matching with Regex: regex()
```
const input = {
  hello: "world"
}

const schema = {
  hello: regex(/^world$/)
}
```

### Composite Schemas: composite(schema, traversalParams, [ownParams])
Let's you apply multiple traversal strategies on a single tree.
Traversal options are specified via a selector. { selector: <name> }

In the following example the property "prop" is traversed without any modifiers,
since the selector is set to "alt".

If ownParams are set, the consolidated result of traversals can be modified again.
```
const input = {
  node: {
    something: "else",
    jeff: "buckley",
    hello: "world",
  },
  prop: "something"
}

const schema = composite(
  {
    something: "else",
    hello: capture({ key: "first" }),
    prop: capture({ key: "second", selector: "alt" })
  },
  [
    { name: "default", modifiers: { object: x => x.node } },
    { name: "alt" },
  ]
)

```

### Advanced
Property Modifier. Use this if your input tree isn't a simple object.
```
const input = {
  getItem(item) {
    return item === "hello" ? "world" : "nothing";
  }
}

const schema = types.obj(
  {
    hello: capture()
  },
  { modifiers: { property: (obj, key) => obj.getItem(key) } }
)

```

### Build
The build option lets you modify the result of a parse.
```
import { builtins as $, capture, Match } from "../../../chimpanzee";

export const input = {
  hello: "world"
};

export const schema = $.obj(
  {
    hello: capture()
  },
  {
    build: obj => context => result =>
      result instanceof Match ? new Match({ hello: `${result.value.hello}!!!` }) : result
  }
);

//The result is Match({ hello: "world!!!" })
```
