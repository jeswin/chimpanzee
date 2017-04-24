/* @flow */
import func from "./function";
import schema from "./schema";
import array from "./array";
import native from "./native";
import obj from "./object";

const index = {
  function: func,
  schema: schema,
  array: array,
  native: native,
  object: obj
};

export default function(schemaType) {
  return (schema, params, inner) => (
    originalObj,
    context,
    key,
    parents,
    parentKeys
  ) => (obj, meta) =>
    index[schemaType](schema, params, inner)(
      originalObj,
      context,
      key,
      parents,
      parentKeys
    )(obj, meta);
}
