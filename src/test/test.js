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
    ['simple-capture', 'simple-capture', false, true],
    ['capture-if', 'capture-if', false, true],
    ['capture-if-negative', 'capture-if-negative', false, false],
    ['nested-capture', 'nested-capture', false, true],
    ['named-capture', 'named-capture', false, true],
    ['capture-parent-child', 'capture-parent-child', false, true],
    ['array-match', 'array-match', false, true],
    ['nested-array-match', 'nested-array-match', false, true],
    ['nested-array-capture', 'nested-array-capture', false, true],
    ['modifier', 'modifier', false, true],
    ['object-modifier', 'object-modifier', false, true],
    ['any', 'any', false, true],
    ['empty', 'empty', false, true],
    ['empty-negative', 'empty-negative', false, false],
    ['reference-parent-state', 'reference-parent-state', false, true],
    ['precondition', 'precondition', false, true],
    ['async-precondition', 'async-precondition', false, true],
    ['async-result', 'async-result', false, true],
    ['assert', 'assert', true, true],
  ];

  for (const test of tests) {
    run(test);
  }

});
