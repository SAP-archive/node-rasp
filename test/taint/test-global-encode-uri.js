'use strict';
require('../common');
const assert = require('assert');

const str1 = 'abc123';
const str2 = '-_.!~*\'()';
const str3 = ';,/?:@&=+$#';
const str4 = 'ABC abc 123';

(() => {
  let encoded;

  encoded = encodeURI(str1.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{'begin': 0, 'end': 6}]);

  encoded = encodeURI(str2.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{'begin': 0, 'end': 9}]);

  encoded = encodeURI(str3.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{'begin': 0, 'end': 11}]);

  encoded = encodeURI(str4.setTaint('foo'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [{'begin': 0, 'end': 15}]);

  encoded = encodeURI(
    str2 + str4.setTaint('foo') + str3 + str4.setTaint('baz'));
  assert.strictEqual(encoded.isTainted(), true);
  assert.taintEqual(encoded, [
    {'begin': 9, 'end': 24},
    {'begin': 35, 'end': 50}
  ]);

})();
