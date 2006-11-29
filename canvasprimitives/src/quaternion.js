CanvasLab.Quaternion = Class.create();
CanvasLab.Quaternion.prototype = {
  initialize: function(xpoint, ypoint, zpoint, width) {
    this.x = xpoint || 0;
    this.y = ypoint || 0;
    this.z = zpoint || 0;
    this.width = width || 1;
  },
  
  invert: function() {
    this.x = -(this.x);
    this.y = -(this.y);
    this.z = -(this.z);
  },
  
  concat: function(quaternion) {
    var width1 = this.width; 
    var x1 = this.x; 
    var y1 = this.y; 
    var z1 = this.z;
    
  	var width2 = quaternion.width; 
  	var x2 = quaternion.x; 
  	var y2 = quaternion.y; 
  	var z2 = quaternion.z;
  	
  	this.width = width1 * width2 - x1 * x2 - y1 * y2 - z1 * z2;
  	this.x = width1 * x2 + x1 * width2 + y1 * z2 - z1 * y2;
  	this.y = width1 * y2 + y1 * width2 + z1 * x2 - x1 * z2;
  	this.z = width1 * z2 + z1 * width2 + x1 * y2 - y1 * x2;
  }
}