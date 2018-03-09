'use strict';
const Buffer = require('buffer').Buffer;

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
  var i;
  for (i = 0; i < path.getTaint().length; i++) {
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
      }
    }
  }
  return path;
}

function removeAllTaintedBuffer(path, toRemove) {
  var arr = [];
  var i;
  var temp = false;
  for (i = 0; i < path.taint.length; i++) {
    arr.push(addBeginning(path, i, temp));
    temp = checkEndOfTaintTraversal(path, i);
    arr.push(mitigateOneTaintBuffer(path, i, toRemove));
  }
  arr.push(addEndOfPath(path, temp));
  path = Buffer.concat(arr);
  return path;
}

function checkEndOfTaintTraversal(path, i) {
  if (path.length > path.taint[i].end &&
    path.slice(path.taint[i].end - 2, path.taint[i] + 1 === '../' ||
    path.slice(path.taint[i].end - 2, path.taint[i] + 1 === '..\\')))
    return true;
  return false;

}

function addBeginning(path, i, temp) {
  if (i === 0)
    return path.slice(0, path.taint[i].begin);
  else if (temp && path.taint[i].begin > path.taint[i - 1].end + 1)
    return path.slice(path.taint[i - 1].end + 1), path.taint[i].begin;
  else if (!temp)
    return path.slice(path.taint[i - 1].end), path.taint[i].begin;

}

function addEndOfPath(path, temp) {
  if (temp)
    return path.slice(path.taint[path.taint.length - 1].end + 1);
  else
    return path.slice(path.taint[path.taint.length - 1].end);
}

function mitigateOneTaintBuffer(path, i, toRemove) {
  var counter = 0;
  var tainted = path.slice(path.taint[i].begin, path.taint[i].end);

  while (tainted.includes(toRemove)) {
    if (path.taint[i].begin + tainted.indexOf(toRemove) +
        toRemove.length + counter * 3 < path.length &&
        (path.slice(path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counter * 3,
                    path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counter * 3 + 1).compare(Buffer.from('2f',
                                                           'hex')) === 0 ||
    path.slice(path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counter * 3,
               path.taint[i].begin + tainted.indexOf(toRemove) +
    toRemove.length + counter * 3 + 1).compare(Buffer.from('5c',
                                                           'hex')) === 0)) {
      var array = [];
      array.push(tainted.slice(0, tainted.indexOf(toRemove)));
      if (tainted.length > tainted.indexOf(toRemove) + toRemove.length)
        array.push(tainted.slice(tainted.indexOf(toRemove) +
          toRemove.length + 1));
      tainted = Buffer.concat(array);
    }
    counter++;
  }
  return tainted;
}

exports.removePathTraversal = removePathTraversal;
