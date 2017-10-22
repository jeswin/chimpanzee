const IS_DEBUG = process.env.CHIMPANZEE_DEBUG;

class ChimpanzeeError extends Error {
  constructor(message, inner, props) {
    super(message);
    this.inner = inner;
    this.props = props;
    this.name = "ChimpanzeeError";
  }
}

export default function(message, inner, props) {
  if (IS_DEBUG && inner.stack) {
    console.log("CHIMPANZEE_DEBUG:", message);
    console.log("CHIMPANZEE_DEBUG:", inner.stack);
  }
  throw new ChimpanzeeError(message, inner, props);
}
