'use strict';
require('../common');
const assert = require('assert');

// ASCII
// const strAscii = 'This is not a tainted string!';
// const strAsciiTaint = 'This is a tainted string!'.setTaint('baz');
// const strAsciiTaintLen = strAsciiTaint.length;
// const bufAsciiTaintLen = Buffer.from(strAsciiTaint).length;

let resultString;

// Concat two simple examples
const buf01_a = Buffer.from('test'.setTaint());
const buf01_b = Buffer.from('abcd');
const buf01 = Buffer.concat([buf01_a, buf01_b], 8);
assert.taintEqual(buf01, [{ 'begin': 0, 'end': 4 }]);
resultString = buf01.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': 4 }]);
resultString = '';

// Extend above test case
// const buf02 = Buffer.concat([buf01_b, buf01_a], 8);
// assert.taintEqual(buf02, [{'begin': 4, 'end': 8}]);
// resultString = buf02.toString('ascii');
// assert.strictEqual(resultString.isTainted(), true);
// assert.taintEqual(resultString, [{'begin': 4, 'end': 8}]);
