var glob = require('glob');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var sm = require('sitemap');

var handleMarginalia = require('./src/marginalia.js');
var handleMarkdown = require('./src/markdown.js');
var handleApi = require('./src/api.js');
var router = require('./src/router.js');

var routes = router.expandRouter({
  'annotated/.*\.html$' : handleMarginalia,
  'api/.*\.html$' : handleApi,
  '.*\.md' : handleMarkdown
});

var makeSitemap = function(files){
  var sitemap = sm.createSitemap({
    hostname: 'http://keechma.com',
    cacheTime: '84000000',
  });
  var processedFiles = _
      .chain(files)
      .map(function(f){
        return f.substr(5);
      })
      .value();
  _.each(processedFiles, function(f){
    sitemap.add({url: f});
  });
  fs.writeFileSync('dest/sitemap.xml', sitemap.toString());
}

var handleFile = function(filename, cleanFilename, destFilename, handler, ext, files){
  console.log('-- STARTING: ' + cleanFilename + ' -> ' + destFilename);
  if(handler){
    return Q.nfcall(fs.readFile, filename, 'utf-8')
      .then(function(content){
        return handler(content, files, destFilename, cleanFilename);
      }).then(function(content){
        return Q.nfcall(mkdirp, path.dirname(destFilename)).then(function(){
          console.log('++ DONE: ' + cleanFilename + ' -> ' + destFilename);
          return Q.nfcall(fs.writeFile, destFilename, content);
        });
      });
  } else {
    return Q.nfcall(mkdirp, path.dirname(destFilename)).then(function(){
      return Q.nfcall(fs.copy, filename, destFilename, {clobber: true}).then(function(){
        console.log('++ DONE: ' + cleanFilename + ' -> ' + destFilename);
      });
    })
  }
}

var calculateHandlerTree = function(files) {
  return _.map(_.reduce(files, function(acc, filename){
    var handler = router.getHandler(routes, filename) || null;
    var ext = path.extname(filename);
    var cleanFilename = filename.substr(5);
    var destFilename;
    var desc = {};

    if (handler) {
      var filenameParts = cleanFilename.replace(ext, '').replace(/^guides\/[0-9]+-/, 'guides/').split('/');

      if (filenameParts[filenameParts.length - 1] === 'index') {
        filenameParts.pop();
      }

      filenameParts = _.map(filenameParts, function(f){
        return f.replace(/\./g, '_');
      })
      
      filenameParts.push('contents.lr');
      filenameParts.unshift('dest');
      
      destFilename = path.join.apply(path, filenameParts);
    } else {
      destFilename = path.join('assets', path.basename(filename));
    }
    acc[destFilename] = {
      filename: filename,
      destFilename: destFilename,
      handler: handler,
      cleanFilename: cleanFilename,
      ext: ext
    }
    return acc;
  }, {}), function(file, key){
    return file;
  });
}

console.log('STARTING BUILD.');

glob('docs/**/*.*', {}, function(err, files){
  return Q.all(_.map(calculateHandlerTree(files), function(f){
    return handleFile(f.filename, f.cleanFilename, f.destFilename, f.handler, f.ext, files);
  })).done(function(){
    console.log('--- DONE!')
  });
});

