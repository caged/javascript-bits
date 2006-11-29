var CanvasLab = {
  VERSION: 'nada'
}


CanvasLab.Base = new Object();
CanvasLab.Base.clone = function(obj) {
  var me = arguments.callee;
  if (arguments.length == 1) {
    me.prototype = obj;
    return new me();
  }
}

alert(HTMLCanvasElement);