'use strict';
require('../common');
const assert = require('assert');

const str1 = 'abc123';
const str2 = '-_.!~*\'()';
const str3 = ';,/?:@&=+$#';
const str4 = 'ABC%20abc%20123';

(() => {
  let decoded;

  decoded = decodeURI(str1.setTaint('foo'));
  assert.strictEqual(decoded.isTainted(), true);
  assert.taintEqual(decoded, [{ 'begin': 0, 'end': 6 }]);

  decoded = decodeURI(str2.setTaint('foo'));
  assert.strictEqual(decoded.isTainted(), true);
  assert.taintEqual(decoded, [{ 'begin': 0, 'end': 9 }]);

  decoded = decodeURI(str3.setTaint('foo'));
  assert.strictEqual(decoded.isTainted(), true);
  assert.taintEqual(decoded, [{ 'begin': 0, 'end': 11 }]);

  decoded = decodeURI(str4.setTaint('foo'));
  assert.strictEqual(decoded.isTainted(), true);
  assert.taintEqual(decoded, [{ 'begin': 0, 'end': 11 }]);

  decoded = decodeURI(
    str2 + str4.setTaint('foo') + str3 + str4.setTaint('baz'));
  assert.strictEqual(decoded.isTainted(), true);
  assert.taintEqual(decoded, [
    { 'begin': 9, 'end': 20 },
    { 'begin': 31, 'end': 42 }
  ]);

})();
