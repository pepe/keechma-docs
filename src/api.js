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

module.exports = (function(){
  var navbar, analytics;
  return function(content){
    var $ = cheerio.load(beautifyHtml(content));


    if(!navbar){
      navbar = fs.readFileSync('templates/navbar.html', 'utf-8');
    }
    $('body').prepend(navbar);
    $('.navbar .container').removeClass('container').addClass('container-fluid');
    $('body>table').addClass('annotated-wrap');
    $('.navbar a').each(function(i, a){
      var $a = $(a);
      if(!isURL($a.attr('href'))){
        $a.attr('href', "../" + $a.attr('href'));
      }
    });

    $('link').remove();
    $('head').append('<link rel="stylesheet" href="../css/site.css"><link rel="stylesheet" href="../css/modifications.css"><link rel="stylesheet" href="../css/api.css">');

    highlight($); 

    $('pre.deps').wrap('<div class="pre-deps-wrap"></div>');
    $('#api-link').addClass('active');
    
    if(!analytics){
      analytics = fs.readFileSync('templates/analytics.html', 'utf-8');
    }
    $('body').append(analytics);

    return $.html();
  };
})();
