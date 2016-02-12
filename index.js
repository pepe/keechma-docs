var glob = require('glob');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var handleMarginalia = require('./src/marginalia.js');
var handleMarkdown = require('./src/markdown.js');

var expandRouter = function(routes){
  var expanded = [];
  for(var k in routes){
    expanded.push([new RegExp(k), routes[k]]);
  }
  return expanded;
}

var getHandler = function(routes, filename){
  var currentIdx = 0;
  var current;
  while(currentIdx < routes.length){
    current = routes[currentIdx];
    if(current[0].test(filename)){
      return current[1];
    }
    currentIdx++;
  }
  throw("No handler for: " + filename);
}


var router = expandRouter({
  'marginalia/.*\.html$' : handleMarginalia,
  '.*\.md' : handleMarkdown
});

var handleFile = function(filename){
  var handler = getHandler(router, filename);
  var ext = path.extname(filename);
  var cleanFilename = filename.substr(5);
  var destFilename = path.join('dest', cleanFilename.replace(ext, '') + '.html');
  console.log('PROCESSING: ' + filename);
  return Q.nfcall(fs.readFile, filename, 'utf-8')
    .then(handler)
    .then(function(contents){
      return Q.nfcall(mkdirp, path.dirname(destFilename)).then(function(){
        return Q.nfcall(fs.writeFile, destFilename, contents);
      });
    });
}


glob('docs/**/*.+(html|md)', {}, function(err, files){
  console.log('STARTING BUILD!');
  return Q.all(_.map(files, function(f){
    return handleFile(f);
  })).done(function(){
    console.log('DONE!');
  });
});

