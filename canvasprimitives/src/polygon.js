CanvasLab.Polygon = Class.create();
CanvasLab.Polygon.prototype = {
  initialize: function(context) {
    this.context = context;
    this.nodes = new Array();
  },
  
  addNode: function(node, isControlPoint) {
    this.nodes.push([node, isControlPoint]);
  },
  
  draw: function() {
    var firstNode = this.nodes.first()[0];

    this.context.moveTo(firstNode.x, firstNode.y);
    this.nodes.each(function(node, index) {
      var curNode = node[0]; 
      var isControlPoint = node[1];
      var prevNode, wasControl;
      if(index != 0) {
        var prevNode = this.nodes[index - 1][0]; 
        var wasControl = this.nodes[index -1][1];
      }
      
      if(!isControlPoint && !wasControl) {
        this.context.lineTo(curNode.x, curNode.y);
      } else if(wasControl) {
        this.context.quadraticCurveTo(prevNode.x, prevNode.y, curNode.x, curNode.y);
      }
      this.z += curNode.z;
      this.context.fill();
    }.bind(this));
  }
}

