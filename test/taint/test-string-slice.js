'use strict';
require('../common');
const assert = require('assert');

(() => {
  const str = 'The morning is upon us.'.taint('bar');
  let slice;

  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{ 'begin': 0, 'end': 23 }]);

  slice = str.slice(1, 8);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 7 }]);

  slice = str.slice(4, -2);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 17 }]);

  slice = str.slice(12);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 11 }]);

  slice = str.slice(30);
  assert.strictEqual(slice.isTainted(), false);
  assert.taintEqual(slice, []);

})();

(() => {
  const str =
    'The ' + 'morning is '.taint('bar') + 'upon us.';
  let slice;

  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{ 'begin': 4, 'end': 15 }]);

  slice = str.slice(1, 8);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 3, 'end': 7 }]);

  slice = str.slice(4, -2);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 11 }]);

  slice = str.slice(12);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 3 }]);

  slice = str.slice(30);
  assert.strictEqual(slice.isTainted(), false);
  assert.taintEqual(slice, []);

})();

(() => {
  const str =
    'The ' + 'morning 😃.'.taint('foo') + 'upon 😃.';
  let slice;

  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{ 'begin': 4, 'end': 15 }]);

  slice = str.slice(1, 8);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 3, 'end': 7 }]);

  slice = str.slice(4, -2);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 11 }]);

  slice = str.slice(12);
  assert.strictEqual(slice.isTainted(), true);
  assert.taintEqual(slice, [{ 'begin': 0, 'end': 3 }]);

  slice = str.slice(30);
  assert.strictEqual(slice.isTainted(), false);
  assert.taintEqual(slice, []);

})();
