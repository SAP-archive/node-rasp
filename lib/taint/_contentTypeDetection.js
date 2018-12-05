// TaintNode
'use strict';

// Return true, if the provided data is a HTML fragment
// Algorithm and signatures are described here (modified):
// https://mimesniff.spec.whatwg.org/

const patterns = [
  '<!DOCTYPE HTML', '<HTML', '<HEAD', '<SCRIPT', '<IFRAME', '<H1',
  '<DIV', '<FONT', '<TABLE', '<A', '<STYLE', '<TITLE', '<B', '<BODY',
  '<BR', '<P', '<!--'
];

function isHTML(data, contentType) {
  if (typeof data !== 'string')
    return false;

  if (contentType === undefined) {
    for (var i = 0; i < patterns.length; i++) {
      if (matchesPattern(data.toUpperCase(), patterns[i]))
        return true;
    }
  } else if (contentType === 'text/html' ||
      contentType === 'application/xml+html') {
    return true;
  }

  return false;
}

function matchesPattern(input, pattern) {
  if (input.length < pattern.length)
    return false;

  input = input.trim();

  for (var p = 0; p < pattern.length; p++) {
    if (input[p] !== pattern[p])
      return false;
  }

  return true;
}

exports.isHTML = isHTML;
