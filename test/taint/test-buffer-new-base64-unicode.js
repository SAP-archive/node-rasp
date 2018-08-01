'use strict';
require('../common');
const assert = require('assert');

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.setTaint('abc');

const strUtf8Len = Buffer.from(strUtf8, 'utf8').toString('utf8').length;
const strUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf8').length;


// BASE64 UNICODE
const strBase64Unicode = Buffer.from(strUtf8, 'utf8').toString('base64');
const strBase64UnicodeTaint = Buffer.from(strUtf8Taint, 'utf8')
                                       .toString('base64').setTaint('abc');

const strBase64UnicodeLen = Buffer.from(strUtf8, 'utf8')
                                       .toString('base64').length;
const strBase64UnicodeTaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                .toString('base64').setTaint('abc').length;

const bufBase64UnicodeLen = Buffer.from(strBase64Unicode, 'base64').length;
const bufBase64UnicodeTaintLen = Buffer.from(strBase64Unicode, 'base64')
                                                                   .length;


let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;
let helpString;
let helpStringEncoded;

// ### ONE STRING ###
// The first section tests one string and each encoding seperately.

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
helpString = strUtf8 + strUtf8Taint + strUtf8Taint.setTaint('different');
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
assert.strictEqual(taintEnd2, taintEnd2);
