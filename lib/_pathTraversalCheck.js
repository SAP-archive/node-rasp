'use strict';
const Buffer = require('buffer').Buffer;

/*
  A path traversal check was incorporated into all
  "File System" module functions that take a path
  parameter. This function first checks whether the
  given path is a String or a Buffer. It then uses the
  corresponding function to check if any taint regions
  contain an instance of "..", followed by either a
  slash or backslash. The instances found are
  removed from the string.
*/

function removePathTraversal(path) {
  if (!path)
    return path;
  if (path.isTainted && path.isTainted()) {
    path = removeAllTaintedString(path, '..');
  } else if (path.taint && path.taint.length > 0) {
    path = removeAllTaintedBuffer(path, '..');
  }
  return path;
}

function removeAllTaintedString(path, toRemove) {
  var toRemoveList = [];
  for (var i = 0; i < path.getTaint().length; i++) {
    var currentTaintLength = path.getTaint().length;
    var tainted = path.substring(path.getTaint()[i].begin,
                                 path.getTaint()[i].end);
    while (tainted.includes(toRemove)) {
      var removalIndex = path.getTaint()[i].begin + tainted.indexOf(toRemove);
      if (path.charAt(removalIndex +
         toRemove.length) === '/' ||
         path.charAt(removalIndex +
         toRemove.length) === '\\') {
        path = path.substring(0, removalIndex) +
               path.substring(removalIndex +
               toRemove.length + 1);
        tainted = tainted.substring(0, tainted.indexOf(toRemove)) +
                  tainted.substring(tainted.indexOf(toRemove) +
                  toRemove.length + 1);
      } else {
        toRemoveList.push(path.indexOf(toRemove));
        path = path.substring(0, removalIndex) +
               path.substring(removalIndex + 1);
        tainted = tainted.substring(0, tainted.indexOf(toRemove)) +
                  tainted.substring(tainted.indexOf(toRemove) + 1);
      }
      if (path.getTaint().length < currentTaintLength)
        i--;
    }
  }
  path = addPeriodsBack(toRemoveList, path);
  return path;
}

function addPeriodsBack(toRemoveList, path) {
  for (var j = 0; j < toRemoveList.length; j++) {
    path = path.substring(0, toRemoveList[j] + j) +
           '.' + path.substring(toRemoveList[j] + j);
  }
  return path;
}

function removeAllTaintedBuffer(path, toRemove) {
  var arr = [];
  var i;
  var endOfTaintTraversal = false;
  for (i = 0; i < path.taint.length; i++) {
    var currentTaintLength = path.taint.length;
    arr.push(addBeginning(path, i, endOfTaintTraversal));
    endOfTaintTraversal = checkEndOfTaintTraversal(path, i);
    arr.push(mitigateOneTaintBuffer(path, i, toRemove));
    if (path.taint.length < currentTaintLength)
      i--;
  }
  arr.push(addEndOfPath(path, endOfTaintTraversal));
  path = Buffer.concat(arr);
  return path;
}

function checkEndOfTaintTraversal(path, i) {
  if (path.length > path.taint[i].end &&
    (path.slice(path.taint[i].end - 2,
                path.taint[i].end + 1).compare(Buffer.from('../')) === 0 ||
    path.slice(path.taint[i].end - 2,
               path.taint[i].end + 1).compare(Buffer.from('..\\')) === 0)) {
    return true;
  }
  return false;
}

function addBeginning(path, i, endOfTaintTraversal) {
  if (i === 0) {
    return path.slice(0, path.taint[i].begin);
  } else if (endOfTaintTraversal && path.taint[i].begin >
             path.taint[i - 1].end + 1) {
    return path.slice(path.taint[i - 1].end + 1, path.taint[i].begin);
  } else if (!endOfTaintTraversal) {
    return path.slice(path.taint[i - 1].end, path.taint[i].begin);
  }
}

function addEndOfPath(path, endOfTaintTraversal) {
  if (endOfTaintTraversal)
    return path.slice(path.taint[path.taint.length - 1].end + 1);
  else
    return path.slice(path.taint[path.taint.length - 1].end);
}

function mitigateOneTaintBuffer(path, i, toRemove) {
  var removedCharCounter = [];
  var tainted = path.slice(path.taint[i].begin, path.taint[i].end);
  var toRemoveList = [];
  var fixedBuffer = [];

  while (tainted.includes(toRemove)) {
    fixedBuffer = [];
    var counterTotal = 0;
    for (var z = 0; z < removedCharCounter.length; z++)
      counterTotal += removedCharCounter[z];
    removeOneInstanceBuffer(path, tainted, fixedBuffer,
                            toRemoveList, removedCharCounter, i,
                            toRemove, counterTotal);
    tainted = Buffer.concat(fixedBuffer);
  }
  return concatNewTainted(toRemoveList, tainted);
}

function removeOneInstanceBuffer(path, tainted, fixedBuffer,
                                 toRemoveList, removedCharCounter,
                                 i, toRemove, counterTotal) {
  var endOfRemovedIndex = path.taint[i].begin + tainted.indexOf(toRemove) +
                          toRemove.length + counterTotal;
  if (endOfRemovedIndex < path.length &&
      (path.slice(endOfRemovedIndex, endOfRemovedIndex + 1)
        .compare(Buffer.from('2f', 'hex')) === 0 ||
       path.slice(endOfRemovedIndex, endOfRemovedIndex + 1)
         .compare(Buffer.from('5c', 'hex')) === 0)) {
    fixedBuffer.push(tainted.slice(0, tainted.indexOf(toRemove)));
    if (tainted.length > tainted.indexOf(toRemove) + toRemove.length)
      fixedBuffer.push(tainted.slice(tainted.indexOf(toRemove) +
                  toRemove.length + 1));
    removedCharCounter.push(3);
  } else {
    fixedBuffer.push(tainted.slice(0, tainted.indexOf(toRemove)));
    toRemoveList.push(tainted.indexOf(toRemove));
    fixedBuffer.push(tainted.slice(tainted.indexOf(toRemove) + 1));
    removedCharCounter.push(1);

  }
}

function concatNewTainted(toRemoveList, tainted) {
  for (var j = 0; j < toRemoveList.length; j++) {
    var tempArr = [];
    tempArr.push(tainted.slice(0, toRemoveList[j] + j));
    tempArr.push(Buffer.from('.'));
    tempArr.push(tainted.slice(toRemoveList[j] + j));
    tainted = Buffer.concat(tempArr);
  }
  return tainted;
}

exports.removePathTraversal = removePathTraversal;
