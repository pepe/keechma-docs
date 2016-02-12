var cheerio = require('cheerio');
var hljs = require('highlight.js');
var fs = require('fs');

module.exports = (function(){
  var navbar;
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
      $(a).attr('href', "../" + $(a).attr('href'));
    });

    return $.html();
  }

})();
