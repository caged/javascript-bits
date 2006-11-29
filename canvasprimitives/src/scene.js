CanvasLab.Scene = Class.create();
CanvasLab.Scene.prototype = {
  initialize: function(options) {
    this.options = Object.extend({
      focalLength: 300,
      nodes: new Array();
      actors: new Array();
      quaternion: new Quaternion();
    }, options || {});
    
    this.pov = 300;
    this.nodes = new Array();
    this.actors = new Array();
    this.quaternion = new Quaternion();
  },
  
  addNode: function(node) {
    this.nodes.push(node);
  },
  
  addActor: function(actor) {
    this.actors.push(actor);
  },
  
  draw: function() {
    this.nodes.each(function(node) {
      node.rotate(this.quaternion);
      node.project(this.options.focalLength);
    });
    
    this.actors.each(draw);
  }
}