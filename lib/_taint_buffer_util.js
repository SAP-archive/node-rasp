'use strict';

const binding = process.binding('buffer');

/*const base64Codes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  + "abcdefghijklmnopqrstuvwxyz0123456789+/=";*/

exports.reapplyTaintToString = (string, buffer, start, end, encoding) => {
  var i;

  if (!buffer._taint || buffer._taint.length < 1) {
    return string;
  }
  const taint = buffer._taint;
  const resultString = '';
  // For hex, ascii, ucs2 I perform the reverse action of applyTaintToBuffer
  //TODO: das geht so nicht, ich schmeiß ja alles ohne taint weg!!!
  const taintLength = taint.length;
  if (['hex'].indexOf(encoding) > -1) {
    for (i = 0; i < taintLength; i++) {
      const curr = taint[i];
      string = addTaintRange(string, '-', curr.begin * 2, curr.end * 2);
    }
    return string;
  }

  if (['ascii', 'binary', 'raw', 'raws'].indexOf(encoding) > -1) {
    for (i = 0; i < taintLength; i++) {
      const curr = taint[i];
      string = addTaintRange(string, '-', curr.begin, curr.end);
    }
    return string;
  }

  if (['ucs2', 'ucs-2', 'utf16le', 'utf-16le'].indexOf(encoding) > -1) {
    for (i = 0; i < taintLength; i++) {
      const curr = taint[i];
      string = addTaintRange(string, '-', curr.begin / 2, curr.end / 2);
    }
    return string;
  }

  if (['base64'].indexOf(encoding) > -1) {
    let whichByteBegin;
    let whichByteEnd;
    let numberOf3BytesWrittenBegin;
    let numberOf3BytesWrittenEnd;
    for (i = 0; i < taintLength; i++) {
      const curr = taint[i];

      whichByteBegin = curr.begin % 3;
      whichByteEnd = curr.end % 3;
      numberOf3BytesWrittenBegin = Math.floor(curr.begin / 3);
      numberOf3BytesWrittenEnd = Math.floor(curr.end / 3);

      const newBegin = numberOf3BytesWrittenBegin * 4 +
                       ByteIndexToBase64Index(whichByteBegin);
      const newEnd = numberOf3BytesWrittenEnd * 4 +
                     ByteIndexToBase64Index(whichByteEnd);
      string = addTaintRange(string, '-', newBegin, newEnd);
    }
    return string;
  }
  if (['utf8', 'utf-8'].indexOf(encoding) > -1) {
    let offset = 0;
    for (i = 0; i < taintLength; i++) {
      // Utf8 char max be inside the string
      const bufferLength = taint[i].end - taint[i].begin;
      const stringLength = taint[i].end - taint[i].begin;
      //buffer.utf8Slice(be, en).length;
      let begin = taint[i].begin;
      let end = taint[i].end;
      if (stringLength !== bufferLength) {
        const difference = stringLength - bufferLength;
        begin += offset;
        end += offset + difference;
        offset += difference;
      }
      string = addTaintRange(string, '-', begin, end);
    }
    return string;
  }
  return resultString;
};

function ByteIndexToBase64Index(index) {
  return (index === 2) ? 3 : index;
}

/*function Base64IndexToByteIndex(index) {
  if (index === 2) {
    return 1;
  } else if (index === 3) {
    return 2;
  } else {
    return index;
  }
}*/

function addTaintRange(string, source, begin, end) {
  const before = string.substring(0, begin);
  const taint = string.substring(begin, end).taint(source);
  const after = string.substring(end, string.length);
  return before + taint + after;
}

exports.applyTaintToBuffer = (buffer, string, encoding,
                              writeOffset, length, written) => {
  // Some attention seeking comment here
  //if (!string.isTainted()) {
    buffer._taint = [];
    return buffer;
  //}
  const taint = []; //string.getTaint();
  writeOffset = (typeof writeOffset === 'undefined') ? 0 : writeOffset;
  length = (typeof length === 'undefined') ? buffer.length : length;
  written = (typeof written === 'undefined') ? 0 : written;

  if (['utf8', 'utf-8'].indexOf(encoding) > -1) {
    let offset = 0;
    let alreadyWritten = 0;
    if (written < 0) {
      written = 0;
    }

    if (taint[0].begin !== 0) {
      const stringLength = taint[0].begin;
      const utf8Length = binding.byteLengthUtf8(
        string.substring(0, stringLength));
      if (stringLength !== utf8Length) {
        offset += utf8Length - stringLength;
      }
      alreadyWritten += utf8Length;
    }

    if (alreadyWritten > written)
      return buffer;

    for (var i = 0; i < taint.length; i++) {
      const stringLength = taint[i].end - taint[i].begin;
      const utf8Length = binding.byteLengthUtf8(
        string.substring(taint[i].begin, taint[i].end));
      const oldRangeEnd = taint[i].end;
      alreadyWritten += utf8Length;

      if (utf8Length !== stringLength) {
        const difference = utf8Length - stringLength;
        taint[i].begin += offset + writeOffset;

        if (written > 0 && alreadyWritten > written) {
          taint[i].end = written + offset + writeOffset;
          break;
        }

        if (taint[i].end > length) {
          taint[i].end = length;
        } else {
          taint[i].end += offset + difference + writeOffset;
        }
        offset += difference;
      }

      //Fill from end of current range to begin of next range
      let nextBegin = string.length;
      if (typeof taint[i + 1] !== 'undefined') {
        nextBegin = taint[i + 1].begin;
      }
      const nextStringLength = nextBegin - oldRangeEnd;
      const nextUtf8Length = binding.byteLengthUtf8(
        string.substring(oldRangeEnd, nextBegin));
      if (nextStringLength !== nextUtf8Length) {
        offset += nextUtf8Length - nextStringLength;
      }

      alreadyWritten += nextUtf8Length;
      if (written > 0 && alreadyWritten > written)
        break;
    }
    buffer._taint = taint;
  }
  if (['ucs2', 'ucs-2', 'utf16le', 'utf-16le'].indexOf(encoding) > -1) {
    if (written < 0) {
      written = 0;
    }
    // expand begin and end by *2, in ucs2 encoding is two bytes
    for (i = 0; i < taint.length; i++) {
      if (taint[i].begin < length) {
        taint[i].begin *= 2;
        taint[i].begin += writeOffset;
        if (written > 0 && taint[i].end * 2 > written) {
          taint[i].end = written + writeOffset;
          break;
        }

        if (taint[i].end > length) {
          taint[i].end = length * 2;
        } else {
          taint[i].end *= 2;
          taint[i].end += writeOffset;
        }
      }
    }
    buffer._taint = taint;
  }
  if (['hex'].indexOf(encoding) > -1) {
    if (written < 0) {
      written = 0;
    }
    // divide by two, two chars in hex encoding are one byte
    for (i = 0; i < taint.length; i++) {
      if (taint[i].begin / 2 < length) {
        taint[i].begin /= 2;
        taint[i].begin += writeOffset;
        if (taint[i].end / 2 > length) {
          taint[i].end = length;
        } else {
          taint[i].end /= 2;
          taint[i].end += writeOffset;
        }
      }
    }
    buffer._taint = taint;
  }
  //TODO
  if (['base64'].indexOf(encoding) > -1) {
    // nothing written
    if (written === 0) {
      buffer._taint = [];
      return buffer;
    }
    // whole original string is tainted with the same range
    if (taint.length === 1 && taint[0].begin === 0 &&
        taint[0].end === string.length) {
      taint[0].begin += writeOffset;
      taint[0].end = written + writeOffset;
      buffer._taint = taint;
      return buffer;
    }

    const newTaint = [];
    let whichByteBegin;
    //let whichByteEnd;
    //let numberOf4BytesWrittenBegin;
    //let numberOf4BytesWrittenEnd;

    for (i = 0; i < taint.length; i++) {
      const curr = taint[i];
      if (curr.begin < length) {
        whichByteBegin = curr.begin % 4;
        //whichByteEnd = curr.end % 4;
        //numberOf4BytesWrittenBegin = Math.floor(curr.begin / 4);
        //numberOf4BytesWrittenEnd = Math.floor(curr.end / 4);

        let newBegin;
        let newEnd;

        // If the taint only covers the 1st byte of a 3 byte block, we continue
        if (curr.end - curr.begin === 1 && whichByteBegin === 0) {
          continue;
        } else if (curr.end - curr.begin === 2) {

        }
        newTaint.push({ begin: newBegin, end: newEnd, flow: curr.flow });
      }
    }
    buffer._taint = newTaint;
  }
  if (['ascii', 'binary', 'raw', 'raws'].indexOf(encoding) > -1) {
    // one byte stays one byte
    for (i = 0; i < taint.length; i++) {
      if (taint[i].begin < length) {
        taint[i].begin += writeOffset;
        if (taint[i].end > length) {
          taint[i].end = length;
        } else {
          taint[i].end += writeOffset;
        }
      }
    }
    buffer._taint = taint;
  }

  return buffer;
};

exports.concatBufferArrayTaint = (list) => {
  return list.reduce((acc, val) => {
    if (typeof val === 'object' && val._taint) {
      val._taint.forEach((range) => {
        acc.taint.push({ 'begin': range.begin + acc.len,
                         'end': range.end + acc.len,
                         'flow': range.flow
        });
      });
    }
    acc.len += val.len;
    return acc;
  }, { 'len': 0, 'taint': [] }).taint;
};

exports.applyArrayTaintToBuffer = (array) => {
  const newTaint = [];
  let accLength = 0;
  for (var i = 0; i < array.length; i++) {
    const element = array[i];
    if (typeof element === 'string') {
      /*if (element.isTainted()) {
        const taint = [];//element.getTaint();
        for (var j = 0; j < taint.length; j++) {
          if (element.indexOf('0x') === 0) {
            newTaint.push({
              begin: taint[j].begin + accLength,
              end: taint[j].begin + accLength + 1, flow: taint[j].flow });
          } else {
            newTaint.push({
              begin: taint[j].begin + accLength,
              end: taint[j].end + accLength, flow: taint[j].flow });
          }
        }
      }*/
    }
    if (typeof element === 'string' && element.indexOf('0x') === 0) {
      accLength += 1;
    } else if (element !== undefined) {
      accLength += element.length;
    }
  }
  return newTaint;
};

/**This function is for all the writeUInt, writeInt,8,16,32, BE, L
 * E functions of the Buffer implementation
 * Backwards is true, when the calling function is a LE (low-endian).
*/
exports.writeBytesToBuffer = (offset, byteLength, string,
                              buffer, backwards) => {
  // we assume that the string is in the format 0x..... so we slice that away
  string = string.slice(2);
  /*if (string.isTainted()) {
    const taints = string.getTaint();
    //const newTaint = [];
    for (var i = 0; i < taints.length; i++) {
      const curr = taints[i];
      if (backwards) {
        //const stringLength = string.length;
        let newBegin = curr.begin;
        let newEnd = curr.end;
        if (string.length > 2) {
          if (curr.end === string.length / 2) {
            newBegin = 0;
          } else {
            newBegin = (curr.end - string.length) * -1;
          }
          newEnd = (curr.begin - string.length) * -1;
        }
        buffer._taint.push({
          begin: (newBegin / 2) + offset,
          end: (newEnd / 2) + offset, flow: curr.flow });
      } else {
        buffer._taint.push({
          begin: (curr.begin / 2) + offset,
          end: (curr.end / 2) + offset, flow: curr.flow });
      }
    }
  }*/
};

/**
 * Returns a new taint array holding a part of the current buffer.
 * Taint ranges are offseted by -begin to start at zero.
 */
exports.subtaint = (buffer, begin, end) => {
  const newTaint = [];
  for (var i = 0; i < buffer._taint.length; i++) {
    const element = buffer._taint[i];
    if (element.begin < end && element.end > begin) {
      newTaint.push({
        begin: Math.max(element.begin, begin) - begin,
        end: Math.min(element.end, end) - begin, flow: element.flow });
    }
  }
  return newTaint;
};

/**
 * Inserts the given taint information into the buffer at the given index
 */
exports.insert = (buffer, index, taints) => {
  const newTaint = [];

  for (var i = 0; i < buffer._taint.length; i++) {
    const range = buffer._taint[i];
    if (range.end <= index) {
      newTaint.push({ begin: range.begin, end: range.end, flow: range.flow });
    }
  }

  let last = index;
  for (i = 0; i < taints.length; i++) {
    const range = taints[i];
    newTaint.push({
      begin: range.begin + index,
      end: range.end + index, flow: range.flow });
    last = range.end + index;
  }

  for (i = 0; i < buffer._taint.length; i++) {
    const range = buffer._taint[i];
    if (range.begin >= last) {
      newTaint.push({ begin: range.begin, end: range.end, flow: range.flow });
    }
  }
  return newTaint;
};

/**
 * Imitates the Buffer.fill method to insert taint information from a string
 * in the same manner as a Buffer is filled with the string contents.
 */
exports.fill = (buffer, string, start, end) => {
  const taint = []; //string.getTaint();

  // fast case, string is fully tainted
  if (taint.length === 1 && taint[0].end - taint[0].begin === string.length) {
    return [{ begin: start, end: end, flow: taint[0].flow }];
  }

  // other cases
  const newTaint = [];
  let fillLength = end - start;
  let oldRangeEnd = 0;
  let offset = 0;
  for (var i = 0; i < taint.length; i++) {
    const curr = taint[i];
    const currLen = curr.end - curr.begin;
    const diffBetweenRanges = curr.begin - oldRangeEnd;
    if (fillLength >= currLen + diffBetweenRanges) {
      // whole range fits
      newTaint.push({
        begin: curr.begin + start + offset,
        end: curr.end + start + offset, flow: curr.flow });
      oldRangeEnd = curr.end;
      fillLength = fillLength - diffBetweenRanges - currLen;
    } else if (fillLength > diffBetweenRanges) {
      // range fits only party
      const newBegin = curr.begin + start + offset;
      newTaint.push({
        begin: newBegin, end: newBegin + fillLength,
        flow: curr.flow });
      fillLength = 0;
    } else {
      break;
    }

    if (i + 1 === taint.length && fillLength > 0) {
      offset = string.length;
      oldRangeEnd = 0;
      i = -1;
    }
  }
  return newTaint;
};
