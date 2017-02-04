import should from "should";
import fs from "fs";
import path from "path";
import sourceMapSupport from 'source-map-support';
import { match } from "../chimpanzee";

sourceMapSupport.install();

describe("chimpanzee", () => {
  function run([description, dir]) {
    it(`${description}`, () => {
      const fixture = require(`./fixtures/${dir}/fixture`);
      const expected = require(`./fixtures/${dir}/expected`);
      const result = match(fixture.schema(fixture.input));
      result.value.should.deepEqual(expected.result);
    });
  }

  const tests = [
    ['simple-capture', 'simple-capture'],
    ['nested-capture', 'nested-capture'],
    ['named-capture', 'named-capture'],
    ['array-match', 'array-match'],
    ['nested-array-match', 'nested-array-match'],
    ['nested-array-capture', 'nested-array-capture'],
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
