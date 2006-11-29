CanvasLab.Line = Class.create();
CanvasLab.Line.prototype = {
  initialize: function(context, startNode, endNode) {
    this.context = context;
    this.startNode = startNode;
    this.endNode = endNode;
  },
  
  draw: function() {
    this.context.moveTo(this.startNode.x, this.startNode.y);
    this.context.lineTo(this.endNode.x, this.endNode.y);
  }
}