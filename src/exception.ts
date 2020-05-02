const IS_DEBUG =
  process.env.CHIMPANZEE_DEBUG === "true" ||
  process.env.CHIMPANZEE_DEBUG === "1";

class ChimpanzeeError extends Error {
  inner: Error | undefined;
  props: { [key: string]: any } | undefined;

  constructor(
    message: string,
    inner: Error | undefined,
    props: { [key: string]: any } | undefined = undefined
  ) {
    super(message);
    this.inner = inner;
    this.props = props;
    this.name = "ChimpanzeeError";
  }
}

export default function (
  message: string,
  inner: Error | undefined,
  props: { [key: string]: any } | undefined = undefined
) : never {
  console.log("CHIMPANZEE_DEBUG:", message);

  if (IS_DEBUG && inner && inner.stack) {
    console.log("CHIMPANZEE_DEBUG:", inner.stack);
  }

  throw new ChimpanzeeError(message, inner, props);
}
