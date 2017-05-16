/* @flow */
import { ObjectSchema, ArraySchema, PrimitiveSchema } from "../schemas";

type Literal = Object | Array<any> | string | number | boolean | Symbol | Function;

export function getSchemaForLiteralChild(schema: ObjectSchema | ArraySchema<any, any>, childSource: Literal) {
  // Value and property modifiers pass through literal containers ({} and []).
  const modifiersForLiteralChildren = schema.params && schema.params.modifiers
    ? {
        modifiers: {
          value: schema.params.modifiers.value,
          property: schema.params.modifiers.property
        }
      }
    : { modifiers: {} };

  // child is { ... }
  const isChildLiteralObject =
    typeof childSource === "object" && childSource.constructor === Object;

  return isChildLiteralObject
    ? new ObjectSchema(childSource, modifiersForLiteralChildren)
    : Array.isArray(childSource)
        ? new ArraySchema(childSource, modifiersForLiteralChildren)
        : typeof childSource === "string" ||
            typeof childSource === "number" ||
            typeof childSource === "boolean" ||
            typeof childSource === "symbol"
            ? new PrimitiveSchema(childSource, modifiersForLiteralChildren)
            : childSource;
}
