import { ObjectSchema, ArraySchema, PrimitiveSchema } from "../schemas";

export function wrapSchemaIfLiteralChild(schema, childSchema) {
  // Value and property modifiers pass through literal containers ({} and []).
  const modifiersForLiteralChildren =
    schema.params && schema.params.modifiers
      ? {
          modifiers: {
            value: schema.params.modifiers.value,
            property: schema.params.modifiers.property
          }
        }
      : { modifiers: {} };

  // child is { ... }
  const isChildLiteralObject =
    typeof childSchema === "object" && childSchema.constructor === Object;

  return isChildLiteralObject
    ? new ObjectSchema(childSchema, modifiersForLiteralChildren)
    : Array.isArray(childSchema)
      ? new ArraySchema(childSchema, modifiersForLiteralChildren)
      : typeof childSchema === "string" ||
        typeof childSchema === "number" ||
        typeof childSchema === "boolean" ||
        typeof childSchema === "symbol"
        ? new PrimitiveSchema(childSchema, modifiersForLiteralChildren)
        : childSchema;
}
