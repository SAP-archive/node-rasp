'use strict';
require('../common');
const assert = require('assert');

const stringASCII_3 = 'foo';
const stringUTF8_3 = '😃!';
const stringASCII_300 = 'foo'.repeat(100);
const stringUTF8_300 = '😃!'.repeat(100);

const stringSet = [stringASCII_3, stringUTF8_3,
                   stringASCII_300, stringUTF8_300];

// assert for string taint
assert.taintEqual = taintEqual;
function taintEqual(string, expectedTaint) {
  const actualTaint = string.getTaint();

  assert.strictEqual(actualTaint.length, expectedTaint.length);

  expectedTaint.forEach(function(range, i) {
    assert.strictEqual(actualTaint[i].begin, range.begin);
    assert.strictEqual(actualTaint[i].end, range.end);
  });
}

stringSet.forEach((string) => {
  const len = string.length;
  let str = string.setTaint('bar'),
    character;

  assert.strictEqual(str.isTainted(), true);
  assert.taintEqual(str, [{'begin': 0, 'end': len}]);

  character = str.charAt(0);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);

  character = str.charAt(1);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);

  character = str.charAt(2);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);

  str = str.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);

  character = str.charAt(0);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);

  character = str.charAt(1);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);

  character = str.charAt(2);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);

  str = str + str.setTaint('foo') + str;
  character = str.charAt(2);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);

  character = str.charAt(len);
  assert.strictEqual(character.isTainted(), true);
  assert.taintEqual(character, [{'begin': 0, 'end': 1}]);

  character = str.charAt(len + len);
  assert.strictEqual(character.isTainted(), false);
  assert.taintEqual(character, []);
});
