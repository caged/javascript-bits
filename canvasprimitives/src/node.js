CanvasLab.Node = Class.create();
CanvasLab.Node.prototype = {
  initialize: function(xpoint, ypoint, zpoint) {
    this.x = xpoint || 0;
    this.y = ypoint || 0;
    this.z = zpoint || 0;
  },
  
  rotate: function(quaternion) {
    var quat1 = CanvasLab.Base.copy(quaternion).invert();
    var quat2 = CanvasLab.Quaternion.fromPoint(this.x, this.y, this.z).concat(quat1);
    var quat3 = CanvasLab.Base.copy(quaternion);
    quat3.concat(quat2);
    this.x = quat3.x;
    this.y = quat3.y;
    this.z = quat3.z;
  },
  
  project: function(by) {
    this.x = by * this.x / (this.z - by);
    this.y = by * this.y / (this.z - by);
  }
}