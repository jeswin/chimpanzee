/* @flow */
export default function(schema, params) {
  return (originalObj, key, parents, parentKeys) => (obj, meta) => context => {
    const result = schema.fn(obj, key, parents, parentKeys)(context);
  };
}
