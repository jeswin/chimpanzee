class ChimpanzeeError extends Error {
  constructor(message, inner, schema) {
    super(message);
    this.inner = inner;
    this.schema = schema;
    this.name = "ChimpanzeeError";
  }
}

export default function(message, inner, schema) {
  throw new ChimpanzeeError(message, inner, schema);
}
