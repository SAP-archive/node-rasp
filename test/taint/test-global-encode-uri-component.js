'use strict';
require('../common');
const assert = require('assert');

const str1 = 'abc123';
const str2 = '-_.!~*\'()';
const str3 = ';,/?:@&=+$#';
const str4 = 'ABC abc 123';

(() => {
  let encoded;

  encoded = encodeURIComponent(str1.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{ 'begin': 0, 'end': 6 }]);

  encoded = encodeURIComponent(str2.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{ 'begin': 0, 'end': 9 }]);

  encoded = encodeURIComponent(str3.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{ 'begin': 0, 'end': 33 }]);

  encoded = encodeURIComponent(str4.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{ 'begin': 0, 'end': 15 }]);

  encoded = encodeURIComponent(
    str2 + str4.setTaint('foo') + str3 + str4.setTaint('baz'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [
    { 'begin': 9, 'end': 24 },
    { 'begin': 57, 'end': 72 }
  ]);

})();
