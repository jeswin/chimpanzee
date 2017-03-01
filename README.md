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
import { match, traverse, capture } from "chimpanzee";

const input = {
  hello: "world"
}

const schema = traverse({
  hello: capture()
})

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


### Simple capturing: capture()
Allows you to capture the value of a node.
```
const input = {
  hello: "world"
}

const schema = traverse({
  hello: capture()
})

//result is Match { value: { hello: "world" } }
```

### Named capturing: capture(alias)
Capture the value of a node and assign a name to it.
```
const input = {
  hello: "world"
}

const schema = traverse({
  hello: capture("prop1")
})

//result is Match { value: { prop1: "world" } }
```

### Capture and modify: capture(predicate, modifier)
Capture the value of a node and assign a name to it.
```
const input = {
  hello: "world"
}

const schema = traverse({
  hello: modify(
    x => x === "world",
    x => `${x}!!!`
  )
})

//result is Match { value: { prop1: "world!!!" } }
```

### Mismatched Tree
```
const input = {
  hello: "world"
}

const schema = traverse({
  something: "else",
  hello: capture()
})

//result is Skip { message: "Expected something to be defined." }
```

### Capture with predicate: captureIf(predicate)
```
const input = {
  hello: "world"
}

const schema = traverse({
  hello: captureIf(x => x === "world")
})

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

const schema = traverse({
  name: string(),
  isHuman: bool(),
  age: number(),
  meta: object(),
  getCoordinates: func()
})
```

### Capture a Literal
```
const input = {
  name: "JPK",
}

const schema = traverse({
  name: literal("JPK"),
})
```

### Matching Arrays
```
const input = {
  myArray: [1, 2, 3]
}

const schema = traverse({ myArray: [number(), number(), number()] });
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

const schema = traverse({
  level1: array([
    repeatingItem(string())
  ])
});
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

const schema = traverse({
  level1: array([
    unorderedItem(string()),
    unorderedItem(bool())
  ])
});
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

const schema = traverse({
  level1: array([
    optionalItem(number()),
    string(),
    bool()
  ])
});

```

### Optional
Matches if found. Does not emit a Skip() if not found.
```
const input = {
  level1: {
    prop1: "hello",
  }
}

const schema = traverse({
  level1: {
    prop1: capture(),
    prop2: optional(capture())
  }
});
```

### Nested
```
const input = {
  inner1: {
   hello: "world"
  }
}

const schema = traverse({
  prop1: "HELLO"
  inner1: traverse({
    hello: capture()
   })
})

//result is Match { value: { inner1: { hello: "world" } } }
```

### Merging with Parent (replace flag)
```

const input = {
  inner1: {
   hello: "world"
  }
}

const schema = traverse(
  {
    inner1: traverse(
      {
        hello: capture()
       }
    )
  },
  { replace: true }
)

//result is Match { value: { hello: "world" } }
```

### Capturing and traversing Child Schema (Parent-Child)
```
const input = {
  level1: {
    level2: "hello world"
  }
}

const schema = traverse({
  level1: captureWithSchema(traverse({
    level2: capture("prop2")
  }), "prop1")
})

//result is Match { prop1: { level2: 'hello world', prop2: 'hello world' } }
```

### Matching Any Schema: any(list)
```
const input = {
  level1: {
    level2: "world"
  }
}

schema1 = traverse({
  level4: capture("hello")
})

schema2 = traverse({
  level1: {
    level2: capture("hello")
  }
});

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

const schema = traverse({
  level1: {
    level2a: deep(traverse({
      level5a: {
        prop3: capture()
      }
    }), "prop1")
  }
})

//result is Match { prop1: { prop3: 'world' } }
```

### Matching undefined or empty: empty()
```
const input = {
  prop1: "hello",
  prop2: undefined
}

const schema = traverse({
  prop1: capture(),
  prop2: empty()
})

//result is Match export const result = { prop1: "hello" }
```

### Matching the existence of a node: exists()
```
export const input = {
  hello: "world",
  prop1: "val1"
}

export const schema = traverse({
  hello: exists(),
  prop1: capture()
})

//This makes sure that hello exists. Or it returns a Skip.
```

### Matching with Regex: regex()
```
const input = {
  hello: "world"
}

const schema = traverse({
  hello: regex(/^world$/)
})
```

### Advanced
Property Modifier. Use this if your input tree isn't a simple object.
```
const input = {
  getItem(item) {
    return item === "hello" ? "world" : "nothing";
  }
}

const schema = traverse({
  hello: capture()
}, { modifier: (obj, key) => obj.getItem(key) })

```

### Builders
Advanced features which let you:
- modify the result of the capture (builder.get)
- Pause traversing until another subtree finishes (builder.precondition)

In the following example, level1 matching waits until level2 is complete (builder.precondition).
And then proceeds to build the result of level1 (builder.get).

```
export const input = {
  level1: {
    prop1: "hello",
  },
  level2: {
    prop2: "world"
  }
}

export const schema = traverse(
  {
    level1: traverse(
      {
        prop1: capture()
      },
      {
        builders: [{
          precondition: (obj, context) => context.parent.state && context.parent.state.prop2,
          get: (obj, context) => ({ prop3: `${context.state.prop1} ${context.parent.state.prop2}` })
        }]
      },
    ),
    level2: {
      prop2: capture(),
    },
  }
)
```

### Builder Asserts
Generates a Fault which will stop the matching on the tree.
```
export const input = {
  prop1: "hello"
}

export const schema = traverse(
  {
    prop1: capture(),
  },
  {
    builders: [{
      asserts: [{ predicate: (obj, context) => context.state.prop1 !== "hello", error: "prop1 cannot be hello" }],
      get: (obj, context) => ({ prop1: context.state.prop1 + " world" })
    }]
  }
)

//This returns a Fault { message: "prop1 cannot be hello" }
```

### Builder Predicates
Similar to Asserts, but returns a Skip instead of Fault.
```
export const input = {
  prop1: "hello"
}

export const schema = traverse(
  {
    prop1: capture(),
  },
  {
    builders: [{
      predicates: [{ predicate: (obj, context) => context.state.prop1 !== "hello", message: "prop1 cannot be hello" }],
      get: (obj, context) => ({ prop1: context.state.prop1 + " world" })
    }]
  }
)

//This returns a Skip { message: "prop1 cannot be hello" }
```
