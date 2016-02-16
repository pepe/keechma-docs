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

var handleFile = function(filename, files){
  var handler = router.getHandler(routes, filename);
  var ext = path.extname(filename);
  var cleanFilename = filename.substr(5);
  var destFilename;
  console.log('-- STARTING: ' + cleanFilename);
  if(handler){
    destFilename = path.join('dest', cleanFilename.replace(ext, '') + '.html');
    return Q.nfcall(fs.readFile, filename, 'utf-8')
    .then(function(content){
      return handler(content, files, cleanFilename.replace(ext, '') + '.html');
    }).then(function(content){
      return Q.nfcall(mkdirp, path.dirname(destFilename)).then(function(){
        console.log('++ DONE: ' + cleanFilename);
        return Q.nfcall(fs.writeFile, destFilename, content);
      });
    });
  } else {
    destFilename = path.join('dest', cleanFilename);
    return Q.nfcall(fs.copy, filename, destFilename, {clobber: true}).then(function(){
      console.log('++ DONE: ' + cleanFilename);
    });
  }
}

console.log('STARTING BUILD.');

fs.copy('site', 'dest', function(err){
  if(err){
    throw err;
  }
  glob('docs/**/*.*', {}, function(err, files){
    return Q.all(_.map(files, function(f){
      return handleFile(f, files);
    })).done(function(){
      glob('dest/**/*.html', {}, function(err, files){
        makeSitemap(files);
        console.log('BUILD DONE.');
      });
    });
  });
});
