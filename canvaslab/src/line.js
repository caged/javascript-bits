
CanvasLab.Line = CanvasLab.Area.extend({
  constructor: function(element, options) {
    this.base(element, options);
    this.closedPath = false;
    this.drawPointCircle = true;
  },
  
  draw: function() {
    this.stage = new CanvasLab.Stage(this.datasets, this.options);
    this._evaluate();    
    this.drawBackground();
    this.drawAxis();
    this.names = this.datasets.names();
    
    var colorCount = this.colors.length;
    this.names.each(function(label, index) { 
      var currentColor = this.colors[index % colorCount].toRGBString();     
      this.context.save();
      this.context.strokeStyle = currentColor;
      this.context.lineWidth = 2.0;
      this.context.lineCap = 'square';
      this.context.lineJoin = 'round';
      this.drawPath(label, this.points);
      this.context.stroke();
      
      this.points.select(function(point) {
        return point.name == label;
      }).each(function(point) {
        this.context.save();
        this.context.beginPath();
        this.context.fillStyle = currentColor;
        this.context.arc(this.area.width * point.x + this.area.x, 
                          this.area.height * point.y + this.area.y, 3, 0, Math.PI*2 , true);
        this.context.fill();
                          
        this.context.restore();
      }.bind(this));
      
      
      
      this.context.restore();
      
    }.bind(this));
    
  }
});