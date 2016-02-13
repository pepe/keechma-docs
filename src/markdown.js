var commonmark = require('commonmark');
var swig = require('swig');
var _ = require('lodash');
var cheerio = require('cheerio');
var fs = require('fs');
var hljs = require('highlight.js');

var buildMenu = function(files){
  // Monstrosity...
  var reader = new commonmark.Parser();
  var writer = new commonmark.HtmlRenderer();
  var files = _
      .chain(files)
      .map(function(f){
        return f.substr(5);
      })
      .filter(function(f){
        if(f.match(/index/i)){
          return false;
        }
        return (f.indexOf('/') === -1 && f.substr(-3) === '.md');
      })
      .map(function(f){
        var parsed = reader.parse(fs.readFileSync('docs/' + f, 'utf-8'));
        var $ = cheerio.load(writer.render(parsed));
        return [f.substring(0, f.length - 2) + 'html' , $('h1').text()];
      })
      .value();
  files.unshift(['index.html', 'Home']);
  return files;
}

var getTitle = function(menu, destFilename){
  for(var i = 0; i < menu.length; i++){
    if(menu[i][0] === destFilename){
      return menu[i][1];
    }
  }
}

var highlight = function($){
  $('.language-clojure').each(function(i, node){
    $(node).html(hljs.highlightAuto($(node).text()).value).addClass('hljs');
  });
  return $;
}


module.exports = (function(){
  var menu;
  return function(content, files, destFilename){
    if(!menu){
      menu = buildMenu(files);
    }
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    var parsed = reader.parse(content);
    var tpl = swig.compileFile('templates/markdown.html');
    var rendered =  writer.render(parsed);

    var $ = cheerio.load(tpl({renderedMarkdown:rendered,
                              menu: menu,
                              destFilename: destFilename,
                              title: getTitle(menu, destFilename)}));

    highlight($);
    if(!destFilename.match(/index/i)){
      $('#guides-link').addClass('active');
    }
    return $.html();
  }
})();
