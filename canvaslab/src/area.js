
CanvasLab.Area = CanvasLab.Base.extend({
  constructor: function(element, options) {
    this.base(element, options);
    this.names = null;
    this.points = [];
    this.closedPath = true;
  },
  
  draw: function() {
    this.stage = new CanvasLab.Stage(this.datasets, this.options);
    this._evaluate();    
    this.drawBackground();
    this.drawAxis();
    this.names = this.datasets.names();
        
    var colorCount = this.colors.length;
    this.names.each(function(label, index) {      
      var color = this.colors[index % colorCount].toRGBString();
      this.context.save();
      this.context.fillStyle = color;
      this.context.strokeStyle = this.theme.borderColor;
      this.context.lineWidth = this.theme.strokeWidth;
      
      if(this.theme.fill) {
        this.drawPath(label, this.points);
        this.context.fill();
      }
      
      if(this.theme.stroke) {
        this.drawPath(label, this.points);
        this.context.stroke();
      }
      
      this.context.restore();
    }.bind(this));
    
  },
  
  _evaluate: function() {
    this.datasets.each(function(dataset) {
      var data = dataset.data.sortBy(function(item) {
        return parseFloat(item[0]);
      });
      
      data.each(function(points) {
       this.points.push({
         x: ((parseFloat(points[0]) - this.stage.minXValue) * this.stage.xScale),
         y: 1.0 - ((parseFloat(points[1]) - this.stage.minYValue) * this.stage.yScale),
         xval: parseFloat(points[0]),
         yval: parseFloat(points[1]),
         name: dataset.name
       });
      }.bind(this));
      
    }.bind(this));
    
    this.stage.calculateXTicks();
    this.stage.calculateYTicks();
  }
});