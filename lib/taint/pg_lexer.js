'use strict';

const pg = process.binding('pg_lexer');

/* Call to libpg_query Lexer */
function getLexerTokens(query) {
  if (query && typeof query === 'string')
    return pg.getLexerTokens(query);
  else
    return [];
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
@return [...] - rangesIn not encompassed by a single rangesOut */
function rangesNotWithinRanges(rangesIn, rangesOut) {
  const violatingRanges = [];
  for (var rIn of rangesIn) {
    for (var rOut of rangesOut) {
      if (rIn.begin < rOut.begin && rOut.begin < rIn.end ||
          rIn.begin < rOut.end && rOut.end < rIn.end) {
        violatingRanges.push(rIn);
        break;
      }
    }
  }
  return violatingRanges;
}

function replaceRangesInQuery(query, ranges, offset) {
  var q = '';
  for (var i = 0, r = 0; r < ranges.length; r++) {
    var range = ranges[r];
    q += query.substring(i, range.begin) + `$${++offset}`;
    i = range.end;
  }
  return q + query.substring(i);
}

function extendParams(params = [], query, injections) {
  injections.forEach((range) => {
    params.push(query.substring(range.begin, range.end));
  });
  return params;
}

exports.checkInjection = (query) => {
  if (!query.isTainted()) return false;
  const tokens = getLexerTokens(query);
  const taint = query.getTaint();
  const injections = rangesNotWithinRanges(taint, tokens);
  return injections.length > 0;
};

exports.removeInjection = (query, params) => {
  if (!query.isTainted()) return {query: query, params: params};
  const tokens = getLexerTokens(query);
  const taint = query.getTaint();
  const injections = rangesNotWithinRanges(taint, tokens);

  return {
    'query': replaceRangesInQuery(query, injections, params.length),
    'params': extendParams(params, query, injections)
  };
};
