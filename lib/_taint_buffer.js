'use strict';

const { byteLength } = require('internal/buffer_util');

exports.utf8Slice = (buf, start, end) => {
  return slice(buf, start, end, 'utf8Slice');
};

exports.asciiSlice = (buf, start, end) => {
  return slice(buf, start, end, 'asciiSlice');
};

exports.ucs2Slice = (buf, start, end) => {
  return slice(buf, start, end, 'ucs2Slice');
};

exports.latin1Slice = (buf, start, end) => {
  return slice(buf, start, end, 'latin1Slice');
};

exports.hexSlice = (buf, start, end) => {
  return slice(buf, start, end, 'hexSlice');
};

function slice(buf, start, end, encodingSlice) {
  let result = '';
  let i = start;
  for (const taint of getSubtaint(buf._taint, start, end)) {
    result += buf[encodingSlice](i, taint.begin);
    result += buf[encodingSlice](taint.begin, taint.end).setTaint('buffer');
    i = taint.end;
  }
  result += buf[encodingSlice](i, end);
  return result;
}

function getSubtaint(taint, begin, end) {
  const result = [];
  for (var i in taint) {
    const range = taint[i];
    if (range.end < begin || range.begin > end) {
      continue;
    } else if (range.begin >= begin && range.end <= end) {
      result.push({ begin: range.begin, end: range.end });
    } else if (range.begin < begin && range.end <= end) {
      result.push({ begin: begin, end: range.end });
    } else if (range.begin < begin && range.end > end) {
      result.push({ begin: begin, end: end });
    } else if (range.begin >= begin && range.end > end) {
      result.push({ begin: range.begin, end: end });
    }
  }
  return result;
}

exports.applyTaintToBuffer = applyTaintToBuffer;

function applyTaintToBuffer(buf, val, start, end, encoding) {

  buf._taint = [];

  if (typeof val !== 'string') return buf;

  for (const taint of val.getTaint()) {
    const offset = byteLength(val.slice(0, taint.begin)
      , encoding);
    const offsetEnd = offset + byteLength(val.slice(taint.begin
      , taint.end), encoding);
    const helpTaint = [{ begin: offset, end: offsetEnd }];
    buf._taint.push(getSubtaint(helpTaint, start, end)[0]);
  }
  return buf;
}

exports.ucs2Write = (buf, string, offset, length) => {
  return write(buf, string, offset, length, 'utf16le', 'ucs2Write');
};

exports.utf8Write = (buf, string, offset, length) => {
  return write(buf, string, offset, length, 'utf8', 'utf8Write');
};

exports.asciiWrite = (buf, string, offset, length) => {
  return write(buf, string, offset, length, 'ascii', 'asciiWrite');
};

function write(buf, string, offset, length, encoding, encodingSlice) {
  const result = buf[encodingSlice](string, offset, length);
  applyTaintToPartialBuffer(buf, string, offset, length, encoding);
  return result;
}

// exports.applyTaintToPartialBuffer = applyTaintToPartialBuffer;

function applyTaintToPartialBuffer(buf, string, offset, length, encoding) {

  const end = offset + length;
  const taintResult = [];

  // Step 1: Keep taint before string range to be inserted.
  for (const taint of buf._taint) {
    if (taint.end < offset) {
      taintResult.push(taint);
    } else if (taint.begin < offset && taint.end >= offset) {
      const helpTaint = [{ begin: taint.begin, end: offset - 1 }];
      taintResult.push(helpTaint);
    } else {
      break;
    }
  }
  // Step 2: Keep taint from string
  for (const taint of string.getTaint()) {
    const taintBegin = byteLength(string.slice(0, taint.begin)
      , encoding);
    const taintEnd = byteLength(string.slice(taint.begin, taint.end)
      , encoding);
    const helpTaint = [{ begin: offset + taintBegin,
                         end: offset + taintEnd }];
    taintResult.push(getSubtaint(helpTaint, offset, end)[0]);
  }
  // Step 3: Keep taint after string range to be inserted.
  for (const taint of buf._taint) {
    if (taint.end <= end) {
      continue;
    } else if (taint.begin <= end && taint.end > end) {
      const helpTaint = [{ begin: end + 1, end: taint.end }];
      taintResult.push(helpTaint);
    } else if (taint.begin > end) {
      taintResult.push(taint);
    }
  }
  // Save the result
  buf._taint = taintResult;
}

exports.concatBufferArrayTaint = concatBufferArrayTaint;

function concatBufferArrayTaint(list) {

  const taintResult = [];
  var offset = 0;

  for (const buffer of list) {
    if (buffer && buffer._taint) {
      for (const taint of buffer._taint) {
        taintResult.push({ begin: offset + taint.begin,
                           end: offset + taint.end });
      }
    }
    offset += buffer.length;
  }
  return taintResult;
}
