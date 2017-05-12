import "babel-polyfill";
import should from "should";
import fs from "fs";
import path from "path";
import sourceMapSupport from "source-map-support";
import { Match, Skip, Fault, Empty } from "../results";
import { match } from "../chimpanzee";
import util from "util";

sourceMapSupport.install();

describe("chimpanzee", () => {
  function run([description, dir, resultType]) {
    it(`${description}`, () => {
      global.__chimpanzeeTestContext = [];
      const fixture = require(`./fixtures/${dir}/fixture`);
      const actual = match(fixture.schema, fixture.input);
      console.log("ACT", actual);
      const expected = require(`./fixtures/${dir}/expected`);
      if (resultType === "match") {
        actual.should.be.an.instanceOf(Match);
        actual.value.should.deepEqual(expected.result);
      } else if (resultType === "empty") {
        actual.should.be.an.instanceOf(Empty);
      } else if (resultType === "skip") {
        actual.should.be.an.instanceOf(Skip);
        actual.message.should.deepEqual(expected.result);
      } else if (resultType === "fault") {
        actual.should.be.an.instanceOf(Fault);
        actual.message.should.deepEqual(expected.result);
      }

      if (expected.allResults) {
        for (const [actualIndex, expectedResult] of expected.allResults) {
          const actualResult = global.__chimpanzeeTestContext[actualIndex];
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
    });
  }

  const tests = [
    ["any", "any", "match"],
    ["any-fault", "any-fault", "fault"],
    ["any-native-types", "any-native-types", "empty"],
    ["any-negative", "any-negative", "skip"],
    ["array", "array", "match"],
    ["array-repeating", "array-repeating", "match"],
    ["array-repeating-fault", "array-repeating-fault", "fault"],
    ["array-unordered", "array-unordered", "match"],
    ["array-unordered-fault", "array-unordered-fault", "fault"],
    ["array-optional", "array-optional", "match"],
    ["array-optional-missing", "array-optional-missing", "match"],
    ["array-mixed", "array-mixed", "match"],
    ["bool", "bool", "match"],
    ["bool-negative", "bool-negative", "skip"],
    // ["builder-assert", "builder-assert", "fault"],
    // ["builder-get-fault", "builder-get-fault", "fault"],
    // ["builder-get-match", "builder-get-match", "match"],
    // ["builder-get-skip", "builder-get-skip", "skip"],
    // ["builder-predicate", "builder-predicate", "skip"],
    ["capture-if", "capture-if", "match"],
    ["capture-if-negative", "capture-if-negative", "skip"],
    ["capture-parent-child", "capture-parent-child", "match"],
    ["capture-simple", "capture-simple", "match"],
    ["child-task-order", "child-task-order", "match"],
    ["composite", "composite", "match"],
    ["composite-complex", "composite-complex", "match"],
    ["composite-own-params", "composite-own-params", "match"],
    ["composite-skip", "composite-skip", "skip"],
    ["deep", "deep", "match"],
    ["deep-fault", "deep-fault", "fault"],
    ["empty", "empty", "match"],
    ["empty-negative", "empty-negative", "skip"],
    ["exists", "exists", "match"],
    ["exists-negative", "exists-negative", "skip"],
    ["func", "func", "match"],
    ["func-negative", "func-negative", "skip"],
    ["function-schema", "function-schema", "match"],
    ["key", "key", "match"],
    ["literal", "literal", "match"],
    ["literal-negative", "literal-negative", "skip"],
    ["map", "map", "match"],
    ["match-negative", "match-negative", "skip"],
    ["named-capture", "named-capture", "match"],
    ["native-array-simple", "native-array-simple", "match"],
    // ["nested-any", "nested-any", "match"],
    // ["nested-native-array-simple", "nested-native-array-simple", "match"],
    // [
    //   "nested-native-array-simple-capture",
    //   "nested-native-array-simple-capture",
    //   "match"
    // ],
    // ["nested-capture", "nested-capture", "match"],
    // ["nested-named-capture", "nested-named-capture", "match"],
    // ["number", "number", "match"],
    // ["number-negative", "number-negative", "skip"],
    // ["object", "object", "match"],
    // ["object-modifier", "object-modifier", "match"],
    // ["object-modifier-skip", "object-modifier-skip", "match"],
    // ["object-negative", "object-negative", "skip"],
    // ["optional", "optional", "match"],
    // ["optional-fault", "optional-fault", "fault"],
    // ["property-modifier", "property-modifier", "match"],
    // ["property-modifier-skip", "property-modifier-skip", "match"],
    // ["regex", "regex", "match"],
    // ["regex-negative", "regex-negative", "skip"],
    // ["string", "string", "match"],
    // ["string-negative", "string-negative", "skip"],
    // ["traverse-traverse-traverse", "traverse-traverse-traverse", "match"],
    // ["traverse-wrapper", "traverse-wrapper", "match"],
    // ["value-modifier", "value-modifier", "match"]
  ];

  for (const test of tests) {
    run(test);
  }
});
