class ChimpanzeeError extends Error {
  constructor(message, inner, props) {
    super(message);
    this.inner = inner;
    this.props = props;
    this.name = "ChimpanzeeError";
  }
}

export default function(message, inner, props) {
  throw new ChimpanzeeError(message, inner, props);
}
