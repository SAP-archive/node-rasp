'use strict';

const pg = process.binding('pg_lexer');
const commentToken = 330;

/* Call to libpg_query Lexer */
function getLexerTokens(query) {
  if (query && typeof query === 'string')
    return pg.getLexerTokens(query);
  else
    return [];
}

function crossesBorder(rIn, rOut) {
  return rIn.begin < rOut.begin && rOut.begin < rIn.end ||
         rIn.begin < rOut.end && rOut.end < rIn.end;
}

function startsComment(rIn, rOut) {
  if (rOut.token === commentToken &&
      rIn.begin <= rOut.begin && rIn.end >= rOut.begin + 2)
    return true;
  else
    return false;
}

/* --- Lexical Analysis ---
This function implements the basic taint-lexical analysis. A user
should only be in control of the content of single lexical tokens.
When a taint-range crosses the borders of a lexical tokens, the
user influences two consecutive lexical tokens and this represents
an injection attack. This functions allows us to check wether
taint ranges cross any token ranges and returns the taint-ranges
violating this rule.

@param rangesIn - Ranges (i.e. taint) that should reside inside
@param rangesOut - Ranges (i.e. token) that should encompass
@return range - first rangesIn not encompassed by a single rangesOut */
function firstRangeNotWithinRanges(rangesIn, rangesOut) {
  for (var rIn of rangesIn) {
    for (var rOut of rangesOut) {
      if (crossesBorder(rIn, rOut) || startsComment(rIn, rOut)) {
        return rIn;
      }
    }
  }
  return null;
}

function replaceRangeInQuery(query, range) {
  return query.substring(0, range.begin) +
         query.substring(range.end);
}

exports.hasInjection = (query = '') => {
  if (!query.isTainted()) return false;
  const tokens = getLexerTokens(query);
  const taint = query.getTaint();
  const injRange = firstRangeNotWithinRanges(taint, tokens);
  return injRange ? true : false;
};

function identifyFirstInjection(query) {
  const taint = query.getTaint();
  const tokens = getLexerTokens(query);
  return firstRangeNotWithinRanges(taint, tokens);
}

exports.removeAllInjections = (query = '') => {
  if (!query.isTainted()) return { 'injected': false };

  let injectedRange = identifyFirstInjection(query);
  if (!injectedRange) return { 'injected': false };
  const vectors = [];
  while (injectedRange) {
    vectors.push(query.substring(injectedRange.begin, injectedRange.end));
    query = replaceRangeInQuery(query, injectedRange);
    injectedRange = identifyFirstInjection(query);
  }

  return { 'injected': true, 'query': query, 'vectors': vectors };
};
