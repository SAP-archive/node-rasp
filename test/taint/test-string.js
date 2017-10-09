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
  testSetAndRemoveTaint(string);
  testStringConcatenation(string);
  testStringPrototypeCharAt(string);
});


// String set and remove complete taint
function testSetAndRemoveTaint(string) {
  const len = string.length;
  let str = string,
    strTaint;

  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);

  strTaint = str.setTaint('bar');
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);
  assert.strictEqual(strTaint.isTainted(), true);
  assert.taintEqual(strTaint, [{'begin': 0, 'end': len}]);

  str = str.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);

  str = strTaint.removeTaint();
  assert.strictEqual(str.isTainted(), false);
  assert.taintEqual(str, []);
  assert.strictEqual(strTaint.isTainted(), true);
  assert.taintEqual(strTaint, [{'begin': 0, 'end': len}]);

  strTaint = strTaint.removeTaint();
  assert.strictEqual(strTaint.isTainted(), false);
  assert.taintEqual(strTaint, []);
}

// String concatenation
function testStringConcatenation(string) {
  const len = string.length;
  const str = string,
    strTaint = string.setTaint('baz');
  let strCon;

  strCon = strTaint + str;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': len}]);

  strCon = str + strCon;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': len, 'end': len + len}]);

  strCon = strTaint + strTaint;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': 0, 'end': len + len}]);

  strCon = str + strTaint + str;
  assert.strictEqual(strCon.isTainted(), true);
  assert.taintEqual(strCon, [{'begin': len, 'end': len + len}]);

  strCon = str + str;
  assert.strictEqual(strCon.isTainted(), false);
  assert.taintEqual(strCon, []);
}

// String.prototype.charAt
function testStringPrototypeCharAt(string) {
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
}
