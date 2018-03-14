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
  var i = 0;
  var toRemoveList = [];
  var counter = 0;
  for (i = 0; i < path.getTaint().length; i++) {
    var currentTaintLength = path.getTaint().length;
    var tainted = path.substring(path.getTaint()[i].begin,
                                 path.getTaint()[i].end);
    while (tainted.includes(toRemove)) {
      if (path.charAt(path.getTaint()[i].begin + tainted.indexOf(toRemove) +
         toRemove.length) === '/' ||
         path.charAt(path.getTaint()[i].begin + tainted.indexOf(toRemove) +
         toRemove.length) === '\\') {
        path = path.substring(0, path.getTaint()[i].begin +
               tainted.indexOf(toRemove)) +
               path.substring(path.getTaint()[i].begin +
               tainted.indexOf(toRemove) +
               toRemove.length + 1);
        tainted = tainted.substring(0, tainted.indexOf(toRemove)) +
                  tainted.substring(tainted.indexOf(toRemove) +
                  toRemove.length + 1);

      } else {
        toRemoveList[counter] = path.indexOf(toRemove);
        counter++;
        path = path.substring(0, path.getTaint()[i].begin +
               tainted.indexOf(toRemove)) +
               path.substring(path.getTaint()[i].begin +
               tainted.indexOf(toRemove) +
               toRemove.length);
        tainted = tainted.substring(0, tainted.indexOf(toRemove)) +
                  tainted.substring(tainted.indexOf(toRemove) +
                  toRemove.length);
      }
      if (path.getTaint().length < currentTaintLength)
        i--;
    }
  }
  for (var j = 0; j < toRemoveList.length; j++) {
    path = path.substring(0, toRemoveList[j] + j * toRemove.length) +
           toRemove + path.substring(toRemoveList[j] +
           j * toRemove.length);

  }

  return path;
}

function removeAllTaintedBuffer(path, toRemove) {
  var arr = [];
  var i;
  var temp = false;
  for (i = 0; i < path.taint.length; i++) {
    var currentTaintLength = path.taint.length;
    arr.push(addBeginning(path, i, temp));
    temp = checkEndOfTaintTraversal(path, i);
    arr.push(mitigateOneTaintBuffer(path, i, toRemove));
    if (path.taint.length < currentTaintLength)
      i--;
  }
  arr.push(addEndOfPath(path, temp));
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

function addBeginning(path, i, temp) {
  if (i === 0) {
    return path.slice(0, path.taint[i].begin);
  } else if (temp && path.taint[i].begin > path.taint[i - 1].end + 1) {
    return path.slice(path.taint[i - 1].end + 1, path.taint[i].begin);
  } else if (!temp) {
    return path.slice(path.taint[i - 1].end, path.taint[i].begin);
  }
}

function addEndOfPath(path, temp) {
  if (temp)
    return path.slice(path.taint[path.taint.length - 1].end + 1);
  else
    return path.slice(path.taint[path.taint.length - 1].end);
}

function mitigateOneTaintBuffer(path, i, toRemove) {
  var counter = [];
  var tainted = path.slice(path.taint[i].begin, path.taint[i].end);
  var toRemoveList = [];
  var count = 0;
  var array = [];

  while (tainted.includes(toRemove)) {
    array = [];
    var counterTotal = 0;
    for (var z = 0; z < counter.length; z++)
      counterTotal += counter[z];

    if (path.taint[i].begin + tainted.indexOf(toRemove) +
        toRemove.length + counterTotal < path.length &&
        (path.slice(path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counterTotal,
                    path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counterTotal + 1).compare(Buffer.from('2f',
                                                            'hex')) === 0 ||
    path.slice(path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counterTotal,
               path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counterTotal + 1).compare(Buffer.from('5c',
                                                            'hex')) === 0)) {
      array.push(tainted.slice(0, tainted.indexOf(toRemove)));
      if (tainted.length > tainted.indexOf(toRemove) + toRemove.length)
        array.push(tainted.slice(tainted.indexOf(toRemove) +
          toRemove.length + 1));
      counter.push(3);

    } else {
      array.push(tainted.slice(0, tainted.indexOf(toRemove)));
      toRemoveList[count] = tainted.indexOf(toRemove);
      count++;
      array.push(tainted.slice(tainted.indexOf(toRemove) + toRemove.length));
      counter.push(2);

    }

    tainted = Buffer.concat(array);
  }

  for (var j = 0; j < toRemoveList.length; j++) {
    var tempArr = [];
    tempArr.push(tainted.slice(0, toRemoveList[j] + j * toRemove.length));
    tempArr.push(Buffer.from(toRemove));
    tempArr.push(tainted.slice(toRemoveList[j] + j * toRemove.length));
    tainted = Buffer.concat(tempArr);
  }
  return tainted;
}

exports.removePathTraversal = removePathTraversal;
