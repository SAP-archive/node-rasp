'use strict';
require('../common');
const assert = require('assert');

// ASCII
const strAsciiTaint = 'This is a tainted string!'.taint('baz');
const strAsciiTaintLen = strAsciiTaint.length;
const bufAsciiTaintLen = Buffer.from(strAsciiTaint).length;

// UTF8
const strUtf8Taint = '😃㻖'.taint('abc');
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

let resultString = '';

// Alloc with Ascii Encoding
const buf01 = Buffer.alloc(bufAsciiTaintLen, strAsciiTaint, 'ascii');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufAsciiTaintLen }]);
resultString = buf01.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Alloc with cuted Ascii Encoding
const buf02 = Buffer.alloc(bufAsciiTaintLen - 1, strAsciiTaint, 'ascii');
assert.taintEqual(buf02, [{ 'begin': 0, 'end': bufAsciiTaintLen - 1 }]);
resultString = buf02.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen - 1 }]);

// Alloc with utf8 encoding
const buf03 = Buffer.alloc(bufUtf8TaintLen, strUtf8Taint, 'utf8');
assert.taintEqual(buf03, [{ 'begin': 0, 'end': bufUtf8TaintLen }]);
resultString = buf03.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8TaintLen }]);

// Alloc with utf16 encoding
const buf04 = Buffer.alloc(bufUtf16TaintLen, strUtf16Taint, 'utf16le');
assert.taintEqual(buf04, [{ 'begin': 0, 'end': bufUtf16TaintLen }]);
resultString = buf04.toString('utf16le');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf16TaintLen }]);

// Alloc with hex encoding
const buf05 = Buffer.alloc(bufHexTaintLen, strHexTaint, 'hex');
assert.taintEqual(buf05, [{ 'begin': 0, 'end': bufHexTaintLen }]);
resultString = buf05.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strHexTaintLen }]);

// Alloc with hex unicode encoding
const buf06 = Buffer.alloc(bufHexUnicodeTaintLen, strHexUnicodeTaint, 'hex');
assert.taintEqual(buf06, [{ 'begin': 0, 'end': bufHexUnicodeTaintLen }]);
resultString = buf06.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strHexUnicodeTaintLen }]);
