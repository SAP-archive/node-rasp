'use strict';
require('../common');
const assert = require('assert');

const string = 'abc123';

let str = string.taint('bar');
let repeated;

repeated = str.repeat(0);
assert.strictEqual(repeated.isTainted(), false);
assert.taintEqual(repeated, []);

repeated = str.repeat(1);
assert.strictEqual(repeated.isTainted(), true);
assert.taintEqual(repeated, [{ 'begin': 0, 'end': 6 }]);

repeated = str.repeat(3);
assert.strictEqual(repeated.isTainted(), true);
assert.taintEqual(repeated, [{ 'begin': 0, 'end': 18 }]);

repeated = str.repeat(1000);
assert.strictEqual(repeated.isTainted(), true);
assert.taintEqual(repeated, [{ 'begin': 0, 'end': 6000 }]);

str = string + string.taint('bar');
repeated = str.repeat(3);
assert.strictEqual(repeated.isTainted(), true);
assert.taintEqual(repeated, [
  { 'begin': 6, 'end': 12 },
  { 'begin': 18, 'end': 24 },
  { 'begin': 30, 'end': 36 }
]);
