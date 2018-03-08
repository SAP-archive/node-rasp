'use strict';
const Buffer = require('buffer').Buffer;
function removeAllTaintedString(path, toRemove) {
  var taint = path.getTaint();
  var i;
  for (i = 0; i < taint.length; i++) {
    var tainted = path.substring(taint[i].begin, taint[i].end);
    while (tainted.includes(toRemove))
      tainted = tainted.replace(toRemove, '');
    path = path.substring(0, taint[i].begin) + tainted +
           path.substring(taint[i].end);
  }
  return path;
}

function removeAllTaintedBufferCorrected(path, toRemove) {

  var arr = [];
  var i;
  var j;
  for (i = 0; i < path.taint.length; i++) {
    if (i === 0)
      arr.push(path.slice(0, path.taint[i].begin));
    else
      arr.push(path.slice(path.taint[i - 1].end, path.taint[i].begin));

    var tainted = path.slice(path.taint[i].begin, path.taint[i].end);
    for (j = 0; j < toRemove.length; j++) {
      while (tainted.includes(toRemove[j])) {
        var array = [];
        array.push(tainted.slice(0, tainted.indexOf(toRemove[j])));
        array.push(tainted.slice(tainted.indexOf(toRemove[j]) +
          toRemove[j].length));
        tainted = Buffer.concat(array);
      }
    }
    arr.push(tainted);
  }
  arr.push(path.slice(path.taint[path.taint.length - 1].end));
  return Buffer.concat(arr);


}

function removeAllTaintedBuffer(path, toRemove) {

  var i;
  for (i = 0; i < path.taint.length; i++) {
    //indexOf, substring is slice
    //concatenating returns a string
    var tainted = path.slice(path.taint[i].begin, path.taint[i].end);
    while (tainted.includes(toRemove)) {
      var array = [];
      array.push(tainted.slice(0, tainted.indexOf(toRemove)));
      array.push(tainted.slice(tainted.indexOf(toRemove) +
        toRemove.length));
      tainted = Buffer.concat(array);
    }
    var arr = [];
    arr.push(path.slice(0, path.taint[i].begin));
    arr.push(tainted);
    arr.push(path.slice(path.taint[i].end));
    path = Buffer.concat(arr);
  }
  return path;

}

function removePathTraversal(path) {
  /*if(path.taint){
    path = path.toString();
    //wrong, but easy solution--would mean I take out the else part of the
    //next if statement
  } */
  if (!path)
    return path;
  if (path.isTainted && path.isTainted()) {
    path = removeAllTaintedString(path, '../');
    path = removeAllTaintedString(path, '..\\');
  } else if (path.taint && path.taint.length > 0) {
    var array = [];
    array.push('../');
    array.push('..\\');
    path = removeAllTaintedBufferCorrected(path, array);
    //path = removeAllTaintedBuffer(path, '..\\');
    //path = removeAllTaintedBuffer(path, '../');

  }
  return path;
}

function removePathTraversalStat(path) {
  if (!path)
    return;
  if (path.isTainted && path.isTainted()) {
    path = removeAllTaintedString(path, '..');
  } else if (path.taint) {
    path = removeAllTaintedBuffer(path, '..');
  }
  return path;
}
/*
function removeAllTaintedStringAlt(path, toRemove) {
  var taint = path.getTaint();
  var i;
  for (i = 0; i < taint.length; i++) {
    var tainted = path.substring(taint[i].begin, taint[i].end);
    while (tainted.includes(toRemove)) {
      if (path.charAr(taint[i].begin + tainted.indexOf(toRemove) +
         toRemove.length) === '/' ||
         path.charAr(taint[i].begin + tainted.indexOf(toRemove) +
         toRemove.length) === '\\') {
        path = path.substring(0, taint[i].begin + tainted.indexOf(toRemove)) +
               path.substring(taint[i].begin + tainted.indexOf(toRemove) +
               toRemove.length + 1);
        tainted = tainted.substring(0, tainted.indexOf(toRemove)) +
                  tainted.substring(tainted.indexOf(toRemove) +
                  toRemove.length + 1);
      }
    }
  }
  return path;
}

function removeAllTaintedBufferAlt(path, toRemove) {
  var i;
  for (i = 0; i < path.taint.length; i++) {
    //indexOf, substring is slice
    //concatenating returns a string
    var tainted = path.slice(path.taint[i].begin, path.taint[i].end);
    while (tainted.includes(toRemove)) {
      if (path.slice(path.taint[i].begin + tainted.indexOf(toRemove) +
          toRemove.length, path.taint[i].begin +
          tainted.indexOf(toRemove) + toRemove.length + 1) === '/' ||
          path.slice(path.taint[i].begin + tainted.indexOf(toRemove) +
                    toRemove.length,
                     path.taint[i].begin + tainted.indexOf(toRemove) +
                    toRemove.length + 1) === '\\') {
        var array = [];
        array.push(tainted.slice(0, tainted.indexOf(toRemove)));
        array.push(tainted.slice(tainted.indexOf(toRemove) +
          toRemove.length + 1));
        tainted = Buffer.concat(array);
        var arr = [];
        arr.push(path.slice(0, path.taint[i].begin));
        arr.push(tainted);
        arr.push(path.slice(path.taint[i].end));
        path = Buffer.concat(arr);
      }
    }
  }
  return path;
}
*/

exports.removePathTraversalStat = removePathTraversalStat;
exports.removePathTraversal = removePathTraversal;
