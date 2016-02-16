var cheerio = require('cheerio');
var hljs = require('highlight.js');
var fs = require('fs');

function isURL(str) {
     var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
     var url = new RegExp(urlRegex, 'i');
     return str.length < 2083 && url.test(str);
}

module.exports = (function(){
  var navbar;
  var analytics;
  return function(content){
    var $ = cheerio.load(content);
    $('td.codes').each(function(i, node){
      var text = $(node).text();
      if(text){
        $(node).html('<pre><code class="language-clojure hljs">' + hljs.highlightAuto(text).value + '</code></pre>');
      }

    });

    $('script, .footer, style').remove();
    $('p').closest('tr').addClass('with-content');
    $('head').append('<link rel="stylesheet" href="../css/site.css"><link rel="stylesheet" href="../css/modifications.css">');

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

    if(!analytics){
      analytics = fs.readFileSync('templates/analytics.html', 'utf-8');
    }
    $('body').append(analytics);

    return $.html();
  }

})();
