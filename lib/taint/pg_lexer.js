'use strict';

const pg = process.binding('pg_lexer');

function getLexerTokens(query) {
  if (query && typeof query === 'string')
    return pg.getLexerTokens(query);
  else
    return [];
}

function areRangesInsideRanges(rangesIn, rangesOut) {
  for (var rIn of rangesIn) {
    for (var rOut of rangesOut) {
      if (rIn.begin < rOut.begin && rOut.begin < rIn.end ||
          rIn.begin < rOut.end && rOut.end < rIn.end) return true;
    }
  }
  return false;
}

exports.checkInjection = (query) => {
  if (!query.isTainted()) return false;
  const tokens = getLexerTokens(query);
  const taint = query.getTaint();
  return areRangesInsideRanges(taint, tokens);
};
