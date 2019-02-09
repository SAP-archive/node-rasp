'use strict';
require('../common');
const assert = require('assert');

let resultString;

// ASCII
const strAsciiTaint = 'This is a tainted string!'.taint('baz');
const strAsciiTaintLen = strAsciiTaint.length;
const bufAsciiTaintLen = Buffer.from(strAsciiTaint).length;

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.taint('abc');
const strUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf8').length;
const bufUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8').length;

// UTF16
const strUtf16Taint = Buffer.from(strUtf8Taint, 'utf8').toString('utf16le')
                                                       .taint('abc');
const strUtf16TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf16le').length;
const bufUtf16TaintLen = Buffer.from(strUtf16Taint, 'utf16le').length;

// HEX
const strHexTaint = Buffer.from(strAsciiTaint, 'ascii').toString('hex')
                                                       .taint('abc');
const strHexTaintLen = Buffer.from(strAsciiTaint, 'ascii')
                                                .toString('hex').length;
const bufHexTaintLen = Buffer.from(strHexTaint, 'hex').length;

// HEX UNICODE
const strHexUnicodeTaint = Buffer.from(strUtf8Taint, 'utf8').toString('hex')
                                                            .taint('abc');
const strHexUnicodeTaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                                     .toString('hex').length;
const bufHexUnicodeTaintLen = Buffer.from(strHexUnicodeTaint, 'hex').length;

// Ascii Encoding
const buf01 = Buffer.allocUnsafe(bufAsciiTaintLen).fill(strAsciiTaint, 'ascii');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufAsciiTaintLen }]);
resultString = buf01.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Utf8 Encoding
const buf02 = Buffer.allocUnsafe(bufUtf8TaintLen).fill(strUtf8Taint, 'utf8');
assert.taintEqual(buf02, [{ 'begin': 0, 'end': bufUtf8TaintLen }]);
resultString = buf02.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8TaintLen }]);

// Utf16 Encoding
const buf03 = Buffer.allocUnsafe(bufUtf16TaintLen).fill(strUtf16Taint
  , 'utf16le');
assert.taintEqual(buf03, [{ 'begin': 0, 'end': bufUtf16TaintLen }]);
resultString = buf03.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf16TaintLen }]);

// Hex Encoding
const buf04 = Buffer.allocUnsafe(bufHexTaintLen).fill(strHexTaint, 'hex');
assert.taintEqual(buf04, [{ 'begin': 0, 'end': bufHexTaintLen }]);
resultString = buf04.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strHexTaintLen }]);

// Hex Unicode Encoding
const buf05 = Buffer.allocUnsafe(bufHexUnicodeTaintLen).fill(
  strHexUnicodeTaint, 'hex');
assert.taintEqual(buf05, [{ 'begin': 0, 'end': bufHexUnicodeTaintLen }]);
resultString = buf05.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strHexUnicodeTaintLen }]);
