export type Primitive = string | number | boolean | Symbol | Function;

export type Context = {
  state: any
};

export type EvalFunction<TObj> = (
  obj: TObj,
  key: string,
  parents: Array<any>,
  parentKeys: Array<string>
) => (context: Context) => Result;
