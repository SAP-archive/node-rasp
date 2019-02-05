'use strict';
require('../common');
const assert = require('assert');

const str1 = 'abc123';
const str2 = '-_.!~*\'()';
const str3 = '%2C%2F%3F%3A%40%26%3D%2B%24%23';
const str4 = 'ABC%20abc%20123';

let decoded;

decoded = decodeURIComponent(str1.taint('foo'));
assert.strictEqual(decoded.isTainted(), true);
assert.taintEqual(decoded, [{ 'begin': 0, 'end': 6 }]);

decoded = decodeURIComponent(str2.taint('foo'));
assert.strictEqual(decoded.isTainted(), true);
assert.taintEqual(decoded, [{ 'begin': 0, 'end': 9 }]);

decoded = decodeURIComponent(str3.taint('foo'));
assert.strictEqual(decoded.isTainted(), true);
assert.taintEqual(decoded, [{ 'begin': 0, 'end': 10 }]);

decoded = decodeURIComponent(str4.taint('foo'));
assert.strictEqual(decoded.isTainted(), true);
assert.taintEqual(decoded, [{ 'begin': 0, 'end': 11 }]);

decoded = decodeURIComponent(
  str2 + str4.taint('foo') + str3 + str4.taint('baz'));
assert.strictEqual(decoded.isTainted(), true);
assert.taintEqual(decoded, [
  { 'begin': 9, 'end': 20 },
  { 'begin': 30, 'end': 41 }
]);
