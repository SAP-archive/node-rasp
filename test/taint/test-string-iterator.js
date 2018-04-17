'use strict';
require('../common');
const assert = require('assert');

const stringASCII_3 = 'foo';
const stringUTF8_3 = '😃!';
const stringASCII_300 = 'foo'.repeat(100);
const stringUTF8_300 = '😃!'.repeat(100);

const stringSet = [stringASCII_3, stringUTF8_3,
                   stringASCII_300, stringUTF8_300];

stringSet.forEach((string) => {
  let str = string.setTaint('bar');
  const strIter = str[Symbol.iterator]();

  for (let i = 0; i < str.length; i++) {
    const v = strIter.next().value;
    assert.strictEqual(v.isTainted(), true);
    assert.taintEqual(v, [{ 'begin': 0, 'end': 1 }]);
  }

  for (const v of str) {
    assert.strictEqual(v.isTainted(), true);
    assert.taintEqual(v, [{ 'begin': 0, 'end': 1 }]);
  }


  str = string + str;
  let i = 0;
  for (const v of str) {
    if (i < string.length) {
      assert.strictEqual(v.isTainted(), false);
      assert.taintEqual(v, []);
    } else {
      assert.strictEqual(v.isTainted(), true);
      assert.taintEqual(v, [{ 'begin': 0, 'end': 1 }]);
    }
    i++;
  }
});
