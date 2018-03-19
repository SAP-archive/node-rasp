'use strict';

const pg = process.binding('pgi');
console.log(pg);
exports.getTokens = pg.getTokens;
