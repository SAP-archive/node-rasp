'use strict';
require('../common');
const assert = require('assert');

const str1 = 'abc123';
const str2 = 'äöü';
const str3 = 'ć';
const str4 = '<script>';

(() => {
  let escaped;

  escaped = escape(str1.setTaint('foo'));
  assert.strictEqual(escaped.isTainted(), true);
  assert.taintEqual(escaped, [{'begin': 0, 'end': 6}]);

  escaped = escape(str2.setTaint('foo'));
  assert.strictEqual(escaped.isTainted(), true);
  assert.taintEqual(escaped, [{'begin': 0, 'end': 9}]);

  escaped = escape(str3.setTaint('foo'));
  assert.strictEqual(escaped.isTainted(), true);
  assert.taintEqual(escaped, [{'begin': 0, 'end': 6}]);

  escaped = escape(str4.setTaint('foo'));
  assert.strictEqual(escaped.isTainted(), true);
  assert.taintEqual(escaped, [{'begin': 0, 'end': 12}]);

  escaped = escape(str2 + str4.setTaint('foo') + str3 + str4.setTaint('baz'));
  assert.strictEqual(escaped.isTainted(), true);
  assert.taintEqual(escaped, [
    {'begin': 9, 'end': 21},
    {'begin': 27, 'end': 39}
  ]);

})();
