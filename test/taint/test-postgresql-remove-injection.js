'use strict';
require('../common');
const { deepStrictEqual } = require('assert');
const { removeAllInjections } = require('../../lib/taint/pg_lexer.js');

const tId = 'foo'.setTaint('bar');
const tId2 = 'baz'.setTaint('bar');
const literalInj = '\' OR 1=1;--'.setTaint('bar');
const idInj = ' OR 1=1;--'.setTaint('bar');
const multiIdInj = 'foo, evil'.setTaint('bar');
const commentInj = ' --'.setTaint('bar');

const q0 = 'SELECT * FROM table WHERE foo=\'bar\';';
deepStrictEqual(removeAllInjections(q0), { injected: false });

const q1 = 'SELECT * FROM table WHERE foo=\'' + tId + '\';';
deepStrictEqual(removeAllInjections(q1), { injected: false });

const q2 = 'SELECT * FROM table WHERE foo=' + tId + ';';
deepStrictEqual(removeAllInjections(q2), { injected: false });

const q3 = 'SELECT * FROM table WHERE ' + tId + '=bar;';
deepStrictEqual(removeAllInjections(q3), { injected: false });

const q4 = 'SELECT * FROM table WHERE ' + tId + '=' + tId + ';';
deepStrictEqual(removeAllInjections(q4), { injected: false });

const q5 = 'SELECT ' + tId + ' FROM table WHERE ' + tId + '=' + tId + ';';
deepStrictEqual(removeAllInjections(q5), { injected: false });

const q6 = 'SELECT ' + tId + ' FROM ' + tId + ' WHERE ' + tId + '=' + tId + ';';
deepStrictEqual(removeAllInjections(q6), { injected: false });

const q7 = 'SELECT ' + tId + ', ' + tId2 + ' FROM table WHERE foo=\'bar\';';
deepStrictEqual(removeAllInjections(q7), { injected: false });

// Sub-select
const q8 = 'SELECT foo FROM (' + q7 + ') WHERE foo=\'bar\';';
deepStrictEqual(removeAllInjections(q8), { injected: false });

const q8a = 'SELECT foo FROM (' + q8 + ') WHERE foo=\'bar\';';
deepStrictEqual(removeAllInjections(q8a), { injected: false });

const q9 = 'SELECT * FROM table WHERE foo=\'abc' + tId + '\';';
deepStrictEqual(removeAllInjections(q9), { injected: false });

const q10 = 'SELECT * FROM table WHERE foo=\'abc' + tId + 'def\';';
deepStrictEqual(removeAllInjections(q10), { injected: false });

const q11 = 'SELECT * FROM table WHERE foo=\'' + tId + 'def\';';
deepStrictEqual(removeAllInjections(q11), { injected: false });

const q12 = 'SELECT foo.' + tId + ' FROM table WHERE foo=\'bar\';';
deepStrictEqual(removeAllInjections(q12), { injected: false });

const q50 = 'SELECT * FROM table WHERE foo=\'' + literalInj + '\';';
const r50 = 'SELECT * FROM table WHERE foo=\'\';';
deepStrictEqual(removeAllInjections(q50),
                {injected: true, query: r50, vectors: [literalInj]});

const q51 = 'SELECT * FROM table WHERE foo=' + idInj + ';';
const r51 = 'SELECT * FROM table WHERE foo=;';
deepStrictEqual(removeAllInjections(q51),
                {injected: true, query: r51, vectors: [idInj]});

const q52 = 'SELECT foo FROM (' + q50 + ') WHERE foo=bar;';
const r52 = 'SELECT foo FROM (' + r50 + ') WHERE foo=bar;';
deepStrictEqual(removeAllInjections(q52),
                {injected: true, query: r52, vectors: [literalInj]});

const q53 = 'SELECT * FROM table WHERE foo=\'' + literalInj +
            '\' OR baz=\'' + literalInj + '\';';
const r53 = 'SELECT * FROM table WHERE foo=\'\' OR baz=\'\';';
deepStrictEqual(removeAllInjections(q53), {injected: true, query: r53,
                vectors: [literalInj, literalInj]});

const q54 = 'SELECT foo FROM (' + q50 + ') WHERE foo=abc.' + idInj + ';';
const r54 = 'SELECT foo FROM (' + r50 + ') WHERE foo=abc.;';
deepStrictEqual(removeAllInjections(q54),
                {injected: true, query: r54, vectors: [literalInj, idInj]});

const q55 = 'SELECT * FROM table WHERE foo=abc' + commentInj + ' OR f=a;';
const r55 = 'SELECT * FROM table WHERE foo=abc OR f=a;';
deepStrictEqual(removeAllInjections(q55),
                {injected: true, query: r55, vectors: [commentInj]});
/*const q51 = 'SELECT * FROM table WHERE foo=' + literalInj + ';';
deepStrictEqual(removeAllInjections(q51),
                       {injected: true,
                        query: 'SELECT * FROM table WHERE foo=;',
                        vectors: [literalInj]});*/

/*const query1 = 'SELECT * FROM table WHERE foo=\'bar\';'.setTaint('bar');
deepStrictEqual(removeInjection(query1, []),
                       {query:''});*/
