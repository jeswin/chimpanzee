import "babel-polyfill";
import should from "should";
import fs from "fs";
import path from "path";
import sourceMapSupport from 'source-map-support';
import { match } from "../chimpanzee";

sourceMapSupport.install();

describe("chimpanzee", () => {
  function run([description, dir, isError, isMatch]) {
    it(`${description}`, async () => {
      const fixture = require(`./fixtures/${dir}/fixture`);
      const result = await match(fixture.schema(fixture.input));
      const expected = require(`./fixtures/${dir}/expected`);
      console.log(result);
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
    // ['simple-capture', 'simple-capture', false, true],
    // ['capture-if', 'capture-if', false, true],
    // ['capture-if-negative', 'capture-if-negative', false, false],
    // ['nested-capture', 'nested-capture', false, true],
    // ['named-capture', 'named-capture', false, true],
    // ['nested-named-capture', 'nested-named-capture', false, true],
    // ['capture-parent-child', 'capture-parent-child', false, true],
    // ['array-match', 'array-match', false, true],
    // ['nested-array-match', 'nested-array-match', false, true],
    // ['nested-array-capture', 'nested-array-capture', false, true],
    // ['modifier', 'modifier', false, true],
    // ['object-modifier', 'object-modifier', false, true],
    // ['any', 'any', false, true],
    // ['map', 'map', false, true],
    // ['empty', 'empty', false, true],
    // ['empty-negative', 'empty-negative', false, false],
    // ['reference-parent-state', 'reference-parent-state', false, true],
    // ['precondition', 'precondition', false, true],
    // ['async-precondition', 'async-precondition', false, true],
    // ['async-result', 'async-result', false, true],
    // ['builder-assert', 'builder-assert', true, true],
    // ['builder-predicate', 'builder-predicate', false, false],
    // ['async-builder-assert', 'async-builder-assert', true, true],
    // ['async-builder-predicate', 'async-builder-predicate', false, false],
    // ['nested-any', 'nested-any', false, true],
    // ['traverse-wrapper', 'traverse-wrapper', false, true],
    // ['optional', 'optional', false, true],
    ['deep', 'deep', false, true],
  ];

  for (const test of tests) {
    run(test);
  }

});
