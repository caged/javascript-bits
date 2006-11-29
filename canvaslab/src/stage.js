
CanvasLab.Stage = Base.extend({
  constructor: function(datasets, options) {
    this.datasets = datasets;
    this.options = Object.extend({
      
    }, options || {});
    
    this.xRange = 0;
    this.yRange = 0;

    this.xScale = 0;
    this.yScale = 0;

    this.xTicks = [];
    this.yTicks = [];

    this.minXValue = 0;
    this.minYValue = 0;
    this.maxXValue = 0;
    this.maxYValue = 0;
    
    this.minXDelta = 0;
    this.minYDelta = 0;
    
    this.calculateLimits();
    this.calculateScales();
  },
  
  calculateLimits: function() {
    var datasets = this.datasets;

    if (!this.options.xAxisRange.include(1)) {
      if (this.options.xOriginZero)
        this.minXValue = 0;
      else
        this.minXValue = datasets.getXValues().min();
    }
    
    if (!this.options.yAxisRange.include(1)) {
      if (this.options.yOriginZero)
        this.minYValue = 0;
      else
        this.minYValue = datasets.getYValues().min();
    }

    this.maxXValue = datasets.getXValues().max();
    this.maxYValue = datasets.getYValues().max();
    
  },
  
  calculateScales: function() {
    this.xRange = this.maxXValue - this.minXValue;
    this.yRange = this.maxYValue - this.minYValue;
    this.xScale = this.xRange == 0 ? 1.0 : 1/this.xRange;
    this.yScale = this.yRange == 0 ? 1.0 : 1/this.yRange;    
  },
  
  calculateXTicks: function() { 
    var xLabels = this.datasets.xLabels;
      
    if(xLabels != null) {
      xLabels.each(function(label) {
          var value = label.value != undefined ? label.value : label;
          var key = label.key != undefined ? label.key : value.toString();          
          var pos = this.xScale * (value - this.minXValue);
        this.xTicks.push([pos, key]);
        
      }.bind(this));
      
    } else if (this.options.xTicksCount) {
      var tickCount = 0, xCount = this.options.xTicksCount;
      var xvalues = this.datasets.uniqueXValues();
      var spacing = this.xRange / xCount;
      
      xvalues.each(function(xvalue) {
        if(xvalue >= (tickCount) * spacing) {
          var pos = this.xScale * (xvalue - this.minXValue);
          if(!$R(0.0, 1.0).include(pos))
            return;
          this.xTicks.push([pos, xvalue]);
          tickCount++;
        }
        if(tickCount > xCount) throw $break();
      }.bind(this));
      
    }
  },
  
  calculateYTicks: function() {
    var yLabels = this.datasets.yLabels;    
    
    if (yLabels != null) {
      yLabels.each(function(label) {        
        var value = label.value != undefined ? label.value : label;
        var key = label.key != undefined ? label.key : value.toString();
        var pos = 1.0 - (this.yScale * (value + this.minXValue));
        
        if(!$R(0.0, 1.0).include(pos))
          return;
        
        this.yTicks.push([pos, key]);
      }.bind(this));
      
    } else if (this.options.yTicksCount) {
      
      var prec = this.options.yTickPrecision;
      var spacing = ToolKit.Format.roundInterval(this.yRange, 
                    this.options.yTicksCount, 
                    this.options.yTickPrecision);

      for (var i = 0; i <= this.options.yTicksCount; i++) {
          var yval = this.minYValue + (i * spacing);
          var pos = 1.0 - ((yval - this.minYValue) * this.yScale);
          this.yTicks.push([pos, ToolKit.Format.roundToFixed(yval, 1)]);
      }
    }
  }
});