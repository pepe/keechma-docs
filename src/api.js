var beautifyHtml = require('js-beautify').html;

module.exports = function(content){
  return beautifyHtml(content);
}
