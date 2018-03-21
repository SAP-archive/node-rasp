'use strict';
require('../common');
const assert = require('assert');

const { checkInjection } = require('../../lib/taint/pg_lexer.js');

const query0 = 'SELECT * FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(checkInjection(query0), false);

const query1 = 'SELECT * FROM table WHERE foo=\'bar\';'.setTaint('bar');
assert.deepStrictEqual(checkInjection(query1), true);

const query2 = 'SELECT * FROM table WHERE foo=\'' +
               'bar\' OR 1=1;--'.setTaint('bar') + ';';
assert.deepStrictEqual(checkInjection(query2), true);

const query3 = 'SELECT ' + 'foo'.setTaint('bar') +
               ', bar FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(checkInjection(query3), false);

const query4 = 'SELECT ' + 'foo, bar'.setTaint('bar') +
               ' FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(checkInjection(query4), true);

const query5 = 'SELECT ' + 'foo, bar'.setTaint('bar') +
               ' FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(checkInjection(query5), true);

const queryLong = 'SELECT ' + 'foo,'.repeat(2000) +
                  ' bar FROM table WHERE foo=\'bar\';';
assert.deepStrictEqual(checkInjection(queryLong), false);

const queryLongInjected = 'SELECT ' + 'foo,'.repeat(2000) +
                          ' bar FROM table WHERE foo=\'' +
                          'bar\' OR 1=1;--'.setTaint('bar') + ';';
assert.deepStrictEqual(checkInjection(queryLongInjected), true);

const queryPlaceholder = 'SELECT foo, har FROM table ' +
                         'WHERE foo=? AND bar=?;';
assert.deepStrictEqual(checkInjection(queryPlaceholder), false);

const queryPlaceholderI = 'SELECT foo, bar FROM table WHERE foo=? AND ' +
                          'bar=bar;'.setTaint('bar');
assert.deepStrictEqual(checkInjection(queryPlaceholderI), true);
