var commonmark = require('commonmark');
var _ = require('lodash');
var cheerio = require('cheerio');
var fs = require('fs');
var hljs = require('highlight.js');

var highlight = function($){
  $('.language-clojure').each(function(i, node){
    $(node).html(hljs.highlightAuto($(node).text()).value).addClass('hljs');
  });
  return $;
}

module.exports = function(content, files, destFilename, sourceFilename){
  var reader = new commonmark.Parser();
  var writer = new commonmark.HtmlRenderer();
  var parsed = reader.parse(content);
  var rendered =  writer.render(parsed);
  var $ = cheerio.load(rendered);
  var order = 1;
  var title = $('h1:nth-child(1)').html();
  var model = 'guides-index';
  var cleanFilename = sourceFilename.replace(/\.md$/, '');

  $('h1:nth-child(1)').remove();

  highlight($);


  if (cleanFilename !== 'guides') {
    order = parseInt(cleanFilename.substr(7), 10);
    model = 'guide';
  }
  
  return [
    "_model: " + model,
    "order: " + order,
    "title: " + title,
    "body:\n\n" + $.html()
  ].join("\n---\n");
}

