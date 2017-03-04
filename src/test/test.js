import "babel-polyfill";
import should from "should";
import fs from "fs";
import path from "path";
import sourceMapSupport from 'source-map-support';
import { Match, Skip, Fault } from "../results";
import { match } from "../chimpanzee";

sourceMapSupport.install();

describe("chimpanzee", () => {
  function run([description, dir, resultType]) {
    it(`${description}`, () => {
      const fixture = require(`./fixtures/${dir}/fixture`);
      const result = match(fixture.schema, fixture.input);
      const expected = require(`./fixtures/${dir}/expected`);
      if (resultType === "return") {
        result.should.be.an.instanceOf(Match);
        result.value.should.deepEqual(expected.result);
      }
      else if (resultType === "skip") {
        result.should.be.an.instanceOf(Skip);
        result.message.should.deepEqual(expected.result);
      }
      else if (resultType === "fault") {
        result.should.be.an.instanceOf(Fault);
        result.message.should.deepEqual(expected.result);
      }
    });
  }

  const tests = [
    ['any', 'any', "return"],
    ['any-negative', 'any-negative', "skip"],
    ['array', 'array', "return"],
    ['array-repeating', 'array-repeating', "return"],
    ['array-unordered', 'array-unordered', "return"],
    ['array-optional', 'array-optional', "return"],
    ['array-mixed', 'array-mixed', "return"],
    ['native-array-simple', 'native-array-simple', "return"],
    ['bool', 'bool', "return"],
    ['bool-negative', 'bool-negative', "skip"],
    ['builder-assert', 'builder-assert', "fault"],
    ['builder-predicate', 'builder-predicate', "skip"],
    ['capture-if', 'capture-if', "return"],
    ['capture-if-negative', 'capture-if-negative', "skip"],
    ['capture-parent-child', 'capture-parent-child', "return"],
    ['capture-simple', 'capture-simple', "return"],
    ['composite', 'composite', "return"],
    ['deep', 'deep', "return"],
    ['empty', 'empty', "return"],
    ['empty-negative', 'empty-negative', "skip"],
    ['exists', 'exists', "return"],
    ['exists-negative', 'exists-negative', "skip"],
    ['func', 'func', "return"],
    ['func-negative', 'func-negative', "skip"],
    ['function-schema', 'function-schema', "return"],
    ['literal', 'literal', "return"],
    ['literal-negative', 'literal-negative', "skip"],
    ['map', 'map', "return"],
    ['match-negative', 'match-negative', "skip"],
    ['modify-predicate', 'modify-predicate', "return"],
    ['modify-replace', 'modify-replace', "return"],
    ['named-capture', 'named-capture', "return"],
    ['nested-any', 'nested-any', "return"],
    ['nested-native-array-simple', 'nested-native-array-simple', "return"],
    ['nested-native-array-simple-capture', 'nested-native-array-simple-capture', "return"],
    ['nested-capture', 'nested-capture', "return"],
    ['nested-named-capture', 'nested-named-capture', "return"],
    ['number', 'number', "return"],
    ['number-negative', 'number-negative', "skip"],
    ['object', 'object', "return"],
    ['object-modifier', 'object-modifier', "return"],
    ['object-modifier-skip', 'object-modifier-skip', "return"],
    ['object-negative', 'object-negative', "skip"],
    ['optional', 'optional', "return"],
    ['precondition', 'precondition', "return"],
    ['property-modifier', 'property-modifier', "return"],
    ['property-modifier-skip', 'property-modifier-skip', "return"],
    ['reference-parent-state', 'reference-parent-state', "return"],
    ['regex', 'regex', "return"],
    ['regex-negative', 'regex-negative', "skip"],
    ['string', 'string', "return"],
    ['string-negative', 'string-negative', "skip"],
    ['traverse-wrapper', 'traverse-wrapper', "return"],
    ['value-modifier', 'value-modifier', "return"],
  ];

  for (const test of tests) {
    run(test);
  }

});
