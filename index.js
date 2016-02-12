var glob = require('glob');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');

var handleMarginalia = require('./src/marginalia.js');
var handleMarkdown = require('./src/markdown.js');
var handleApi = require('./src/api.js');
var router = require('./src/router.js');

var routes = router.expandRouter({
  'annotated/.*\.html$' : handleMarginalia,
  'api/.*\.html$' : handleApi,
  '.*\.md' : handleMarkdown
});

var handleFile = function(filename, files){
  var handler = router.getHandler(routes, filename);
  var ext = path.extname(filename);
  var cleanFilename = filename.substr(5);
  var destFilename;
  console.log('-- PROCESSING: ' + filename);
  if(handler){
    destFilename = path.join('dest', cleanFilename.replace(ext, '') + '.html');
    return Q.nfcall(fs.readFile, filename, 'utf-8')
    .then(function(content){
      return handler(content, files, cleanFilename.replace(ext, '') + '.html');
    }).then(function(content){
      return Q.nfcall(mkdirp, path.dirname(destFilename)).then(function(){
        console.log('-- WRITING: ' + destFilename);
        return Q.nfcall(fs.writeFile, destFilename, content);
      });
    });
  } else {
    destFilename = path.join('dest', cleanFilename);
    return Q.nfcall(fs.copy, filename, destFilename, {clobber: true}).then(function(){
      console.log('-- WRITING: ' + destFilename);
    });
  }
}

fs.copy('site', 'dest', function(err){
  if(err){
    throw err;
  }
  glob('docs/**/*.*', {}, function(err, files){
    console.log('STARTING BUILD!');
    return Q.all(_.map(files, function(f){
      return handleFile(f, files);
    })).done(function(){
      console.log('DONE!');
    });
  });
})



