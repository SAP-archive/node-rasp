'use strict';
require('../common');
const assert = require('assert');

// ASCII
const strAscii = 'This string is not tainted!';
const strAsciiTaint = 'This is a tainted string!'.taint('baz');
const strAsciiLen = strAscii.length;
const strAsciiTaintLen = strAsciiTaint.length;

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.taint('abc');

const strUtf8Len = Buffer.from(strUtf8, 'utf8').toString('utf8').length;
const strUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf8').length;

// const bufUtf8Len = Buffer.from(strUtf8, 'utf8').length;
// const bufUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8').length;

// HEX
const strHex = Buffer.from(strAscii, 'ascii').toString('hex');
const strHexTaint = Buffer.from(strAsciiTaint, 'ascii').toString('hex')
                                                       .taint('abc');
const strHexLen = Buffer.from(strAscii, 'ascii').toString('hex').length;
const strHexTaintLen = Buffer.from(strAsciiTaint, 'ascii')
                                                .toString('hex').length;
const bufHexLen = Buffer.from(strHex, 'hex').length;
const bufHexTaintLen = Buffer.from(strHexTaint, 'hex').length;

// HEX UNICODE
const strHexUnicode = Buffer.from(strUtf8, 'utf8').toString('hex');
const strHexUnicodeTaint = Buffer.from(strUtf8Taint, 'utf8').toString('hex')
                                                            .taint('abc');

const strHexUnicodeLen = Buffer.from(strUtf8, 'utf8').toString('hex').length;
const strHexUnicodeTaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                                     .toString('hex').length;

const bufHexUnicodeLen = Buffer.from(strHexUnicode, 'hex').length;
const bufHexUnicodeTaintLen = Buffer.from(strHexUnicodeTaint, 'hex').length;

// BASE64
const strBase64 = Buffer.from(strAscii, 'ascii').toString('base64');
const strBase64Taint = Buffer.from(strAsciiTaint, 'ascii').toString('base64')
                                                          .taint('abc');

const strBase64Len = Buffer.from(strAscii, 'ascii').toString('base64')
                                                                   .length;
const strBase64TaintLen = Buffer.from(strAsciiTaint, 'ascii')
                                .toString('base64').taint('abc').length;

const bufBase64Len = Buffer.from(strBase64, 'base64').length;
const bufBase64TaintLen = Buffer.from(strBase64Taint, 'base64').length;

// BASE64 UNICODE
const strBase64Unicode = Buffer.from(strUtf8, 'utf8').toString('base64');
const strBase64UnicodeTaint = Buffer.from(strUtf8Taint, 'utf8')
                                       .toString('base64').taint('abc');

const strBase64UnicodeLen = Buffer.from(strUtf8, 'utf8')
                                       .toString('base64').length;
const strBase64UnicodeTaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                .toString('base64').taint('abc').length;

const bufBase64UnicodeLen = Buffer.from(strBase64Unicode, 'base64').length;
const bufBase64UnicodeTaintLen = Buffer.from(strBase64Unicode, 'base64')
                                                                   .length;

// UTF16LE
const strUtf16 = Buffer.from(strUtf8, 'utf8').toString('utf16le');
const strUtf16Taint = Buffer.from(strUtf8Taint, 'utf8').toString('utf16le')
                                                       .taint('abc');
let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;
let helpString;
let helpStringEncoded;

// ### ONE STRING / EACH ENCODING ###
// The first section tests one string and each encoding seperately.

// Test 5: Utf16le string in buffer is tainted.
const buf5 = new Buffer(strUtf16Taint, 'utf16le');
assert.taintEqual(buf5, [{ 'begin': 0, 'end': buf5.length }]);
resultString = buf5.toString('utf16le');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
// assert.taintEqual(resultString, [{'begin': 0, 'end': strUtf16Taint.length}]);

// Test 6: Utf16le string in buffer is not tainted.
const buf6 = new Buffer(strUtf16, 'utf16le');
assert.taintEqual(buf6, []);
resultString = buf6.toString('utf16le');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// Test 7: Hex string in buffer is tainted.
const buf7 = new Buffer(strHexTaint, 'hex');
assert.taintEqual(buf7, [{ 'begin': 0, 'end': buf7.length }]);
resultString = buf7.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaint.length }]);

// Test 8: Hex string in buffer is not tainted.
const buf8 = new Buffer(strHex, 'hex');
assert.taintEqual(buf8, []);
resultString = buf8.toString('ascii');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// Test 9: HexUnicode string in buffer is tainted.
const buf9 = new Buffer(strHexUnicodeTaint, 'hex');
assert.taintEqual(buf9, [{ 'begin': 0, 'end': buf9.length }]);
resultString = buf9.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8Taint.length }]);

// Test 10: HexUnicode string in buffer is not tainted.
const buf10 = new Buffer(strHexUnicode, 'hex');
assert.taintEqual(buf10, []);
resultString = buf10.toString('utf8');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// Test 11: Base64 string in buffer is tainted.
const buf11 = new Buffer(strBase64Taint, 'base64');
assert.taintEqual(buf11, [{ 'begin': 0, 'end': buf11.length }]);
resultString = buf11.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaint.length }]);

// Test 12: Base64 string in buffer is not tainted.
const buf12 = new Buffer(strBase64, 'base64');
assert.taintEqual(buf12, []);
resultString = buf12.toString('ascii');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// Test 13: Base64Unicode string in buffer is tainted.
const buf13 = new Buffer(strBase64UnicodeTaint, 'base64');
assert.taintEqual(buf13, [{ 'begin': 0, 'end': buf13.length }]);
resultString = buf13.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8Taint.length }]);

// Test 14: Base64Unicode string in buffer is not tainted.
const buf14 = new Buffer(strBase64Unicode, 'base64');
assert.taintEqual(buf14, []);
resultString = buf14.toString('utf8');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// ### Concatenation of strings ###
// I concatenate the strings of the same encodings.

// ### HEX ###

// Test 26: Concatenated hex string: One tainted string
const buf26 = new Buffer(strHex + strHexTaint + strHex, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen;
assert.taintEqual(buf26, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf26.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf26.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Test 27: Concatenated hex string: Two same tainted string
const buf27 = new Buffer(strHex + strHexTaint + strHexTaint +
                                                strHex, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen * 2;
assert.taintEqual(buf27, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf27.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf27.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen * 2;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Test 28: Concatenated hex string: Two different tainted string
const buf28 = new Buffer(strHex + strHexTaint.taint('different') +
                                  strHexTaint + strHex, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufHexTaintLen;
assert.taintEqual(buf28, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test HEX
resultString = buf28.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strHexTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);
// Test ASCII
resultString = buf28.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// Test 29: HEX string: Taint at the beginning
const buf29 = new Buffer(strHexTaint + strHex, 'hex');
taintStart = 0;
taintEnd = bufHexTaintLen;
assert.taintEqual(buf29, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf29.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf29.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Test 30: HEX string: Taint at the end
const buf30 = new Buffer(strHex + strHexTaint, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen;
assert.taintEqual(buf30, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf30.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf30.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Test 31: Hex String at the beginning and the end
const buf31 = new Buffer(strHexTaint + strHex + strHexTaint, 'hex');
taintStart = 0;
taintEnd = bufHexTaintLen;
taintStart2 = taintEnd + bufHexLen;
taintEnd2 = taintStart2 + bufHexTaintLen;
assert.taintEqual(buf31, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test HEX
resultString = buf31.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexTaintLen;
taintStart2 = taintEnd + strHexLen;
taintEnd2 = taintStart2 + strHexTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2}]);
// Test ASCII
resultString = buf31.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
taintStart2 = taintEnd + strAsciiLen;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// ### HEX UNICODE ###

// Test 32: Concatenated hex string: One tainted string
const buf32 = new Buffer(strHexUnicode + strHexUnicodeTaint + strHexUnicode,
                         'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen;
assert.taintEqual(buf32, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf32.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf32.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 33: Concatenated hex string: Two same tainted string
const buf33 = new Buffer(strHexUnicode + strHexUnicodeTaint +
                         strHexUnicodeTaint + strHexUnicode, 'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen * 2;
assert.taintEqual(buf33, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf33.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf33.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);


// Test 34: Concatenated hex string: Two different tainted string
const buf34 = new Buffer(strHexUnicode + strHexUnicodeTaint
             .taint('different') + strHexUnicodeTaint + strHexUnicode,
                         'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufHexUnicodeTaintLen;
assert.taintEqual(buf34, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test HEX
resultString = buf34.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strHexUnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);
// Test UTF8
resultString = buf34.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                 {'begin': taintStart2, 'end': taintEnd2 }]);

// Test 35: HEX string: Taint at the beginning
const buf35 = new Buffer(strHexUnicodeTaint + strHexUnicode, 'hex');
taintStart = 0;
taintEnd = bufHexUnicodeTaintLen;
assert.taintEqual(buf35, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf35.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexUnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf35.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);


// Test 36: HEX string: Taint at the end
const buf36 = new Buffer(strHexUnicode + strHexUnicodeTaint, 'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen;
assert.taintEqual(buf36, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf36.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf36.toString('utf8');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 37: Hex String at the beginning and the end
const buf37 = new Buffer(strHexUnicodeTaint + strHexUnicode +
                         strHexUnicodeTaint, 'hex');
taintStart = 0;
taintEnd = bufHexUnicodeTaintLen;
taintStart2 = taintEnd + bufHexUnicodeLen;
taintEnd2 = taintStart2 + bufHexUnicodeTaintLen;
assert.taintEqual(buf37, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);

// Test HEX
resultString = buf37.toString('hex');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexUnicodeTaintLen;
taintStart2 = taintEnd + strHexUnicodeLen;
taintEnd2 = taintStart2 + strHexUnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2}]);
// Test UTF8
resultString = buf37.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
taintStart2 = taintEnd + strUtf8Len;
taintEnd2 = taintStart2 + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                 {'begin': taintStart2, 'end': taintEnd2 }]);

// ### BASE64 ###

// Test 38: Concatenated base64 string: One tainted string
helpString = strAscii + strAsciiTaint + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf38 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf38, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf38.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf38.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 39: Concatenated base64 string: Two same tainted string
helpString = strAscii + strAsciiTaint + strAsciiTaint + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf39 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen * 2;
// TODO: fails
// assert.taintEqual(buf39, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf39.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf39.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 40: Concatenated base64 string: Two different tainted string
helpString = strAscii + strAsciiTaint + strAsciiTaint.taint('different');
helpString = helpString + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf40 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf40, [{'begin': taintStart, 'end': taintEnd },
//                           {'begin': taintStart2, 'end': taintEnd2 }]);
// Test BASE64
resultString = buf40.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);
// Test ASCII
resultString = buf40.toString('ascii');
// TODO: fail
// sassert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                 {'begin': taintStart2, 'end': taintEnd2 }]);

// Test 41: Base64 string: Taint at the beginning
helpString = strAsciiTaint + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf41 = new Buffer(helpStringEncoded, 'base64');
taintStart = 0;
taintEnd = bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf41, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf41.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf41.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 42: BASE64 string: Taint at the end
helpString = strAscii + strAsciiTaint;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf42 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf42, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf42.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf42.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 43: Base64 String at the beginning and the end
helpString = strAsciiTaint + strAscii + strAsciiTaint;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf43 = new Buffer(helpStringEncoded, 'base64');
taintStart = 0;
taintEnd = bufBase64TaintLen;
taintStart2 = taintEnd + bufBase64Len;
taintEnd2 = taintStart2 + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf43, [{'begin': taintStart, 'end': taintEnd },
//                           {'begin': taintStart2, 'end': taintEnd2 }]);
// Test BASE64
resultString = buf43.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strBase64TaintLen;
taintStart2 = taintEnd + strBase64Len;
taintEnd2 = taintStart2 + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2}]);
// Test ASCII
resultString = buf43.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
taintStart2 = taintEnd + strAsciiLen;
taintEnd2 = taintStart2 + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                {'begin': taintStart2, 'end': taintEnd2 }]);

// ### BASE64 Unicode ###

// Test 44: Concatenated base64 string: One tainted string
helpString = strUtf8 + strUtf8Taint + strUtf8;
helpStringEncoded = Buffer.from(helpString, 'utf8').toString('base64');
const buf44 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64UnicodeLen;
taintEnd = taintStart + bufBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(buf44, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf44.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64UnicodeLen;
taintEnd = taintStart + strBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf44.toString('utf8');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 45: Concatenated base64 string: Two same tainted string
helpString = strUtf8 + strUtf8Taint + strUtf8Taint + strUtf8;
helpStringEncoded = Buffer.from(helpString, 'utf8').toString('base64');
const buf45 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64UnicodeLen;
taintEnd = taintStart + bufBase64UnicodeTaintLen * 2;
// TODO: fails
// assert.taintEqual(buf45, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf45.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64UnicodeLen;
taintEnd = taintStart + strBase64UnicodeTaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf45.toString('utf8');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 46: Concatenated base64 string: Two different tainted string
helpString = strUtf8 + strUtf8Taint + strUtf8Taint.taint('different');
helpString = helpString + strUtf8;
helpStringEncoded = Buffer.from(helpString, 'utf8').toString('base64');
const buf46 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64UnicodeLen;
taintEnd = taintStart + bufBase64UnicodeTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(buf46, [{'begin': taintStart, 'end': taintEnd },
//                           {'begin': taintStart2, 'end': taintEnd2 }]);
// Test BASE64
resultString = buf46.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64UnicodeLen;
taintEnd = taintStart + strBase64UnicodeTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);
// Test UTF8
resultString = buf46.toString('utf8');
// TODO: fail
// sassert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);

// Test 47: Base64 string: Taint at the beginning
helpString = strUtf8Taint + strUtf8;
helpStringEncoded = Buffer.from(helpString, 'utf8').toString('base64');
const buf47 = new Buffer(helpStringEncoded, 'base64');
taintStart = 0;
taintEnd = bufBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(buf47, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf47.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf47.toString('utf8');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 48: BASE64 string: Taint at the end
helpString = strUtf8 + strUtf8Taint;
helpStringEncoded = Buffer.from(helpString, 'utf8').toString('base64');
const buf48 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64UnicodeLen;
taintEnd = taintStart + bufBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(buf48, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE
resultString = buf48.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64UnicodeLen;
taintEnd = taintStart + strBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test UTF8
resultString = buf48.toString('utf8');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 49: Base64 String at the beginning and the end
helpString = strUtf8Taint + strUtf8 + strUtf8Taint;
helpStringEncoded = Buffer.from(helpString, 'utf8').toString('base64');
const buf49 = new Buffer(helpStringEncoded, 'base64');
taintStart = 0;
taintEnd = bufBase64UnicodeTaintLen;
taintStart2 = taintEnd + bufBase64UnicodeLen;
taintEnd2 = taintStart2 + bufBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(buf49, [{'begin': taintStart, 'end': taintEnd },
//                           {'begin': taintStart2, 'end': taintEnd2 }]);
// Test BASE64
resultString = buf49.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strBase64UnicodeTaintLen;
taintStart2 = taintEnd + strBase64UnicodeLen;
taintEnd2 = taintStart2 + strBase64UnicodeTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2}]);
// Test UTF8
resultString = buf49.toString('utf8');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
taintStart2 = taintEnd + strUtf8Len;
taintEnd2 = taintStart2 + strUtf8TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);
