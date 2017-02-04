import should from "should";
import fs from "fs";
import path from "path";
import sourceMapSupport from 'source-map-support';
import { match } from "../chimpanzee";

sourceMapSupport.install();

describe("chimpanzee", () => {
  function run([description, dir, isMatch]) {
    it(`${description}`, () => {
      const fixture = require(`./fixtures/${dir}/fixture`);
      const expected = require(`./fixtures/${dir}/expected`);
      const result = match(fixture.schema(fixture.input));
      if (isMatch) {
        result.value.should.deepEqual(expected.result);
      } else {
        should(result.value).not.be.ok;
      }
    });
  }

  const tests = [
    ['simple-capture', 'simple-capture', true],
    ['capture-if', 'capture-if', true],
    ['capture-if-negative', 'capture-if-negative', false],
    ['nested-capture', 'nested-capture', true],
    ['named-capture', 'named-capture', true],
    ['array-match', 'array-match', true],
    ['nested-array-match', 'nested-array-match', true],
    ['nested-array-capture', 'nested-array-capture', true],
    ['modifier', 'modifier', true],
    ['object-modifier', 'object-modifier', true],
    // ['import-select', 'import-select', { import: true }],
    // ['import-update', 'import-update', { import: true }],
    // ['insert', 'insert'],
    // ['map', 'map'],
    // ['select', 'select'],
    // ['select-all', 'select-all'],
    // ['select-count', 'select-count'],
    // ['select-map', 'select-map'],
    // ['select-slice', 'select-slice'],
    // ['select-sort', 'select-sort'],
    // ['slice', 'slice'],
    // ['sort', 'sort'],
    // ['update', 'update'],
  ];

  for (const test of tests) {
    run(test);
  }


});
