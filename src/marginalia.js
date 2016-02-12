var cheerio = require('cheerio');
var hljs = require('highlight.js');

module.exports = function(content){
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
  
  return $.html();
}
