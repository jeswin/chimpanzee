import "mocha";
import "should";
import { Match, Skip, Fault, Empty } from "../results";
import { match } from "..";

describe("chimpanzee", () => {
  function run([description, dir, resultType]: [string, string, string]) {
    it(`${description}`, async () => {
      if (["match", "empty", "skip", "fault"].includes(resultType)) {
        (global as any).__chimpanzeeTestContext = [];
        const fixture = await import(`./fixtures/${dir}/fixture`);
        const actual = match(fixture.schema, fixture.input);
        const expected = await import(`./fixtures/${dir}/expected`);
        if (resultType === "match") {
          actual.should.be.an.instanceOf(Match);
          ((actual as Match).value as any).should.deepEqual(expected.result);
        } else if (resultType === "empty") {
          actual.should.be.an.instanceOf(Empty);
        } else if (resultType === "skip") {
          actual.should.be.an.instanceOf(Skip);
          (actual as Skip).message.should.equal(expected.result);
        } else if (resultType === "fault") {
          actual.should.be.an.instanceOf(Fault);
          (actual as Fault).message.should.equal(expected.result);
        }

        if (expected.allResults) {
          for (const [actualIndex, expectedResult] of expected.allResults) {
            const actualResult = (global as any).__chimpanzeeTestContext[
              actualIndex
            ];
            if (expectedResult.message) {
              actualResult.message.should.equal(expectedResult.message);
            }
            if (expectedResult.env && expectedResult.env.parentKeys) {
              actualResult.env.parentKeys.should.deepEqual(
                expectedResult.env.parentKeys
              );
            }
            if (expectedResult.meta && expectedResult.meta.type) {
              actualResult.meta.type.should.equal(expectedResult.meta.type);
            }
          }
        }
      } else {
        const fixture = await import(`./fixtures/${dir}/fixture`);
        fixture.fn();
      }
    });
  }

  const tests = [
    ["any", "any", "match"],
    ["any-fault", "any-fault", "fault"],
    ["any-native-types", "any-native-types", "empty"],
    ["any-negative", "any-negative", "skip"],
    ["array", "array", "match"],
    ["array-exact", "array-exact", "match"],
    ["array-exact-negative", "array-exact-negative", "skip"],
    ["array-injects-modifiers", "array-injects-modifiers", "empty"],
    [
      "array-injects-modifiers-with-capture",
      "array-injects-modifiers-with-capture",
      "match",
    ],
    [
      "array-inside-object-injects-modifiers",
      "array-inside-object-injects-modifiers",
      "match",
    ],
    ["array-mixed", "array-mixed", "match"],
    ["array-optional", "array-optional", "match"],
    ["array-optional-missing", "array-optional-missing", "match"],
    ["array-recursive", "array-recursive", "match"],
    ["array-recursive-fault", "array-recursive-fault", "fault"],
    ["array-repeating", "array-repeating", "match"],
    ["array-repeating-fault", "array-repeating-fault", "fault"],
    ["array-unordered", "array-unordered", "match"],
    ["array-unordered-fault", "array-unordered-fault", "fault"],
    ["array-unordered-with-needle", "array-unordered-with-needle", "match"],
    ["bool", "bool", "match"],
    ["bool-negative", "bool-negative", "skip"],
    ["build", "build", "match"],
    ["build-must-wrap-non-result", "build-must-wrap-non-result", "match"],
    ["capture-if", "capture-if", "match"],
    ["capture-if-negative", "capture-if-negative", "skip"],
    ["capture-parent-child", "capture-parent-child", "match"],
    ["capture-simple", "capture-simple", "match"],
    ["child-task-order", "child-task-order", "match"],
    ["child-task-order-missing", "child-task-order-missing", "match"],
    ["composite", "composite", "match"],
    ["composite-arrays", "composite-arrays", "match"],
    ["composite-arrays-merge", "composite-arrays-merge", "match"],
    ["composite-complex", "composite-complex", "match"],
    ["composite-nested", "composite-nested", "match"],
    ["composite-own-params", "composite-own-params", "match"],
    ["composite-skip", "composite-skip", "skip"],
    ["context-reset-in-child-object", "context-reset-in-child-object", "match"],
    [
      "context-reset-override-in-child-object",
      "context-reset-override-in-child-object",
      "match",
    ],
    ["deep", "deep", "match"],
    ["deep-fault", "deep-fault", "fault"],
    ["empty", "empty", "match"],
    ["empty-negative", "empty-negative", "skip"],
    ["exists", "exists", "match"],
    ["exists-negative", "exists-negative", "skip"],
    ["func", "func", "match"],
    ["func-negative", "func-negative", "skip"],
    ["function-can-parse", "function-can-parse", "match"],
    ["function-schema", "function-schema", "match"],
    ["key", "key", "match"],
    ["literal", "literal", "match"],
    ["literal-negative", "literal-negative", "skip"],
    ["map", "map", "match"],
    ["match-negative", "match-negative", "skip"],
    ["modify", "modify", "match"],
    ["named-capture", "named-capture", "match"],
    ["native-array-simple", "native-array-simple", "match"],
    ["native-array-simple-negative", "native-array-simple-negative", "skip"],
    ["nested-any", "nested-any", "match"],
    ["nested-native-array-simple", "nested-native-array-simple", "match"],
    [
      "nested-native-array-simple-capture",
      "nested-native-array-simple-capture",
      "match",
    ],
    ["nested-capture", "nested-capture", "match"],
    ["nested-named-capture", "nested-named-capture", "match"],
    ["number", "number", "match"],
    ["number-negative", "number-negative", "skip"],
    ["object", "object", "match"],
    ["object-injects-modifiers", "object-injects-modifiers", "match"],
    [
      "object-inside-array-injects-modifiers",
      "object-inside-array-injects-modifiers",
      "match",
    ],
    ["object-modifier", "object-modifier", "match"],
    ["object-modifier-override", "object-modifier-override", "match"],
    ["object-negative", "object-negative", "skip"],
    ["optional", "optional", "match"],
    ["optional-fault", "optional-fault", "fault"],
    ["permute", "permute"],
    ["permute-array", "permute-array"],
    ["permute-object", "permute-object"],
    ["property-modifier", "property-modifier", "match"],
    ["property-modifier-nested", "property-modifier-nested", "match"],
    ["property-modifier-override", "property-modifier-override", "match"],
    ["regex", "regex", "match"],
    ["regex-negative", "regex-negative", "skip"],
    ["string", "string", "match"],
    ["string-negative", "string-negative", "skip"],
    ["then", "then", "match"],
    ["then-negative", "then-negative", "skip"],
    ["then-fail-schema", "then-fail-schema", "skip"],
    ["value-modifier", "value-modifier", "match"],
    ["wrap", "wrap", "match"],
  ];

  for (const test of tests) {
    run(test as [string, string, string]);
  }
});
