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
      $(a).attr('href', "../" + $(a).attr('href'));
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
