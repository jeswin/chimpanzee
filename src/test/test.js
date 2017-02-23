import "babel-polyfill";
import should from "should";
import fs from "fs";
import path from "path";
import sourceMapSupport from 'source-map-support';
import { match } from "../chimpanzee";

sourceMapSupport.install();

describe("chimpanzee", () => {
  function run([description, dir, isError, isMatch]) {
    it(`${description}`, () => {
      const fixture = require(`./fixtures/${dir}/fixture`);
      const result = match(fixture.schema(fixture.input));
      const expected = require(`./fixtures/${dir}/expected`);
      console.log("RES::::", result);
      if (isError) {
        result.type.should.equal("error");
        result.message.should.deepEqual(expected.result);
      } else {
        if (isMatch) {
          result.value.should.deepEqual(expected.result);
        } else {
          result.type.should.equal("skip");
          result.message.should.deepEqual(expected.result);
        }
      }
    });
  }

  const tests = [
    ['any', 'any', false, true],
    // ['any-negative', 'any-negative', false, false],
    // ['array', 'array', false, true],
    // ['array-simple', 'array-simple', false, true],
    // ['async-builder-assert', 'async-builder-assert', true, true],
    // ['async-builder-predicate', 'async-builder-predicate', false, false],
    // ['async-precondition', 'async-precondition', false, true],
    // ['async-result', 'async-result', false, true],
    // ['bool', 'bool', false, true],
    // ['bool-negative', 'bool-negative', false, false],
    // ['builder-assert', 'builder-assert', true, true],
    // ['builder-predicate', 'builder-predicate', false, false],
    // ['capture-if', 'capture-if', false, true],
    // ['capture-if-negative', 'capture-if-negative', false, false],
    // ['capture-parent-child', 'capture-parent-child', false, true],
    // ['deep', 'deep', false, true],
    // ['empty', 'empty', false, true],
    // ['empty-negative', 'empty-negative', false, false],
    // ['exists', 'exists', false, true],
    // ['exists-negative', 'exists-negative', false, false],
    // ['func', 'func', false, true],
    // ['func-negative', 'func-negative', false, false],
    // ['map', 'map', false, true],
    // ['match-negative', 'match-negative', false, false],
    // ['modifier', 'modifier', false, true],
    // ['named-capture', 'named-capture', false, true],
    // ['nested-any', 'nested-any', false, true],
    // ['nested-array-simple', 'nested-array-simple', false, true],
    // ['nested-array-simple-capture', 'nested-array-simple-capture', false, true],
    // ['nested-capture', 'nested-capture', false, true],
    // ['nested-named-capture', 'nested-named-capture', false, true],
    // ['number', 'number', false, true],
    // ['number-negative', 'number-negative', false, false],
    // ['object', 'object', false, true],
    // ['object-modifier', 'object-modifier', false, true],
    // ['object-negative', 'object-negative', false, false],
    // ['optional', 'optional', false, true],
    // ['precondition', 'precondition', false, true],
    // ['reference-parent-state', 'reference-parent-state', false, true],
    // ['regex', 'regex', false, true],
    // ['regex-negative', 'regex-negative', false, false],
    // ['simple-capture', 'simple-capture', false, true],
    // ['string', 'string', false, true],
    // ['string-negative', 'string-negative', false, false],
    // ['traverse-wrapper', 'traverse-wrapper', false, true],
  ];

  for (const test of tests) {
    run(test);
  }

});
