
CanvasLab.Bar = CanvasLab.Base.extend({
  constructor: function(element, options) {
    var opts = Object.extend({
      fillFraction: 0.75
    }, options || {});
    
    this.base(element, opts);
    this.bars = [];
  },
  
  draw: function() {
    this.stage = new CanvasLab.Stage(this.datasets, this.options);
    this._evaluate();    
    this._centerTicks();    
    this.drawBackground();
    this.drawAxis();        
    
    
    var colorCount = this.theme.colorScheme.colors.length;
    var colorScheme = this.theme.colorScheme.colors;
    var setNames = this.datasets.names();
    var setCount = setNames.length;

    setNames.each(function(setName, index) {
      var color = colorScheme[index % colorCount];
      this.context.save();      
      this.context.fillStyle = color.toRGBString();
      this.context.strokeStyle = this.theme.borderColor;
      this.context.lineWidth = this.theme.strokeWidth;
      this.bars.each(function(bar) {
        if(setName == bar.name) {
          if(this.theme.drawShadow) {
            this.context.shadowBlur = this.theme.shadowBlur;
            this.context.shadowColor = ToolKit.Color.fromHexString(this.theme.shadowColor).toRGBString();
          }
          this.drawRectangle(bar);
        }
      }.bind(this));
      this.context.restore(); 
    }.bind(this));
  },
  
  _evaluate: function() {
    var setCount = this.datasets.names().length;
    var barWidth = 0, barWidthForSet = 0, barMargin = 0;
    var xvalues = this.datasets.uniqueXValues(), xdelta = 10000000;
    
    for(var i = 1; i < xvalues.length; i++) {
      xdelta = Math.min(Math.abs(xvalues[i] - xvalues[i - 1]), xdelta); 
    }
    
    
    if(xvalues.length == 1) {
      
      xdelta = 1.0;
      this.stage.xScale = 1.0;
      this.stage.minXValue = xvalues[0];
      barWidth = 1.0 * this.options.fillFraction;
      barWidthForSet = barWidth/setCount;
      barMargin = (1.0 - this.options.fillFraction) / 2;
      
    } else {
      
      this.stage.xScale = (1.0 - xdelta/this.stage.xRange)/this.stage.xRange;
      barWidth = xdelta * this.stage.xScale * this.options.fillFraction;
      barWidthForSet = barWidth / setCount;
      barMargin = xdelta * this.stage.xScale * (1.0 - this.options.fillFraction) / 2;
      
    }
    
    this.stage.minXDelta = xdelta;    
    this.datasets.each(function(dataset, index) {
      dataset.data.each(function(points) {        
        var stub = this.theme.strokeWidth / 200;
        var rect = {
          x: ((parseFloat(points[0]) - this.stage.minXValue) * this.stage.xScale) + (index * barWidthForSet) + barMargin,
          y: (1.0 - stub) - ((parseFloat(points[1]) - this.stage.minYValue) * this.stage.yScale),
          width: barWidthForSet,
          height: ((parseFloat(points[1]) - this.stage.minYValue) * this.stage.yScale),
          xval: parseFloat(points[0]),
          yval: parseFloat(points[1]),
          name: dataset.name 
        }
        this.bars.push(rect);
      }.bind(this));
    }.bind(this));
    
    if(this.options.horizontal == true) {
      this.bars.collect(function(bar) {
        var oldx = bar.x;
        var oldheight = bar.height;
        bar.x = 0.0;
        bar.y = oldx;
        bar.height = bar.width;
        bar.width = oldheight;
      
        return bar;
      }.bind(this));
    }
    
    this.stage.calculateXTicks();
    this.stage.calculateYTicks();
    
  },
  
  _centerTicks: function() {
    this.stage.xTicks = this.stage.xTicks.collect(function(tick) {
      return [tick[0] + (this.stage.minXDelta * this.stage.xScale)/2, tick[1]];
    }.bind(this));
    
    if(this.options.horizontal) {
      var xticks = this.stage.xTicks;
      this.stage.xTicks = this.stage.yTicks;
      this.stage.xTicks = this.stage.xTicks.collect(function(tick) {
        return  [1.0 - tick[0], tick[1]];
      });
      this.stage.yTicks = xticks;
    }  
  }
  
});