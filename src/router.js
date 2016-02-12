module.exports = {
  expandRouter: function(routes){
    var expanded = [];
    for(var k in routes){
      expanded.push([new RegExp(k), routes[k]]);
    }
    return expanded;
  },

  getHandler: function(routes, filename){
    var currentIdx = 0;
    var current;
    while(currentIdx < routes.length){
      current = routes[currentIdx];
      if(current[0].test(filename)){
        return current[1];
      }
      currentIdx++;
    }
  }
}
