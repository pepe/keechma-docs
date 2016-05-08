var beautifyHtml = require('js-beautify').html;
var cheerio = require('cheerio');
var fs = require('fs');
var hljs = require('highlight.js');

var highlight = function($){
  $('.clojure').each(function(i, node){
    $(node).html(hljs.highlightAuto($(node).text()).value).addClass('hljs');
  });
  return $;
}

function isURL(str) {
  var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
}

function rewriteURLs($, destFilename) {
  $('.sidebar.secondary a').each(function(){
    var $a = $(this);
    $a.attr('href', '#' + $a.attr('href').split('#').pop());
  });

  $('.sidebar.primary a').each(function(){
    var $a = $(this);
    var href = $a.attr('href');
    var isIndex = $a.closest('.index-link').length > 0;
    var depth = parseInt($a.closest('li').attr('class').match(/\bdepth-([0-9]+)\b/)[1], 10);
    
    if (isIndex) {
      href = '/api/' + destFilename.split('/')[0] + '/';
      $a.attr('href', href);
    } else {
      href = '/api/' + destFilename.split('/')[0] + '/' + href.replace(/\.html$/, '').replace(/\./, '_');
      $a.attr('href', href);
    }
  });

  $('.namespace a').each(function(){
    var $a = $(this);
    var href = $a.attr('href');
    var hrefParts = href.split('#');

    hrefParts[0] = hrefParts[0].replace(/\.html$/, '').replace(/\./, '_')

    $a.attr('href', hrefParts.join('#'));
  })
}

module.exports = function(content, files, destFilename){
  var $ = cheerio.load(beautifyHtml(content));
  var title = 'API / ' + $('title').text();
  $('#header').remove();
  $('body>table').addClass('annotated-wrap');
  $('link').remove();

  highlight($); 
  rewriteURLs($, destFilename.replace(/^dest\/api\//, '').replace(/\/contents\.lr$/, ''));
  
  $('pre.deps').wrap('<div class="pre-deps-wrap"></div>');

  return [
    "_model: api-annotated",
    "title: " + title,
    "body:\n\n" + '<div class="api-container">' + $('body').html() + '</div>'
  ].join("\n---\n");
};

