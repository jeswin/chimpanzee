/* @flow */
export default function(schema: OperatorSchema) : Result {
  return (originalObj, key, parents, parentKeys) => obj => context => {
    const effectiveObj = params.modifiers.value ? params.modifiers.value(obj) : obj;
    return schema.fn(effectiveObj, key, parents, parentKeys)(context);
  };
}
