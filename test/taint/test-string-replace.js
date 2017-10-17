'use strict';
require('../common');
const assert = require('assert');

const abc = 'abc123';

((string) => {
  let str = string.setTaint('bar');
  let replaced;

  replaced = str.replace('123', '321');
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [{'begin': 0, 'end': 3}]);

  replaced = str.replace('abc', '321');
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [{'begin': 3, 'end': 6}]);

  replaced = str.replace('abc', 'a');
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [{'begin': 1, 'end': 4}]);

  replaced = str.replace('abc123', 'replaced');
  assert.strictEqual(replaced.isTainted(), false);
  assert.taintEqual(replaced, []);

  replaced = str.replace('abc', 'ABC'.setTaint('bar'));
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [
    {'begin': 0, 'end': 3},
    {'begin': 3, 'end': 6}
  ]);

  replaced = str.replace('bc12', 'replaced'.setTaint('bar'));
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [
    {'begin': 0, 'end': 1},
    {'begin': 1, 'end': 9},
    {'begin': 9, 'end': 10}
  ]);

  replaced = str.replace('c1', 'replaced'.setTaint('baz'));
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [
    {'begin': 0, 'end': 2},
    {'begin': 2, 'end': 10},
    {'begin': 10, 'end': 12}
  ]);

  str = str.removeTaint() + str;
  replaced = str.replace(/c1/, 'replaced'.setTaint('baz'));
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [
    {'begin': 2, 'end': 10},
    {'begin': 12, 'end': 18}
  ]);

  replaced = str.replace(/c1/g, 'replaced'.setTaint('baz'));
  assert.strictEqual(replaced.isTainted(), true);
  assert.taintEqual(replaced, [
    {'begin': 2, 'end': 10},
    {'begin': 12, 'end': 14},
    {'begin': 14, 'end': 22},
    {'begin': 12, 'end': 24}
  ]);
})(abc);
