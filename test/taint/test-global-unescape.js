'use strict';
require('../common');
const assert = require('assert');

const str1 = 'abc123';
const str2 = '%E4%F6%FC';
const str3 = '%u0107';
const str4 = '%3Cscript%3E';

let unescaped;

unescaped = unescape(str1.taint('foo'));
assert.strictEqual(unescaped.isTainted(), true);
assert.taintEqual(unescaped, [{ 'begin': 0, 'end': 6 }]);

unescaped = unescape(str2.taint('foo'));
assert.strictEqual(unescaped.isTainted(), true);
assert.taintEqual(unescaped, [{ 'begin': 0, 'end': 3 }]);

unescaped = unescape(str3.taint('foo'));
assert.strictEqual(unescaped.isTainted(), true);
assert.taintEqual(unescaped, [{ 'begin': 0, 'end': 1 }]);

unescaped = unescape(str4.taint('foo'));
assert.strictEqual(unescaped.isTainted(), true);
assert.taintEqual(unescaped, [{ 'begin': 0, 'end': 8 }]);

unescaped = unescape(
  str2 + str4.taint('foo') + str3 + str4.taint('baz'));
assert.strictEqual(unescaped.isTainted(), true);
assert.taintEqual(unescaped, [
  { 'begin': 3, 'end': 11 },
  { 'begin': 12, 'end': 20 }
]);
