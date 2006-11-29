Plastik.Abstract.Stage = function() {
  this.types = ['bar', 'pie', 'point', 'line'];
}

Plastik.Abstract.Stage.prototype = {
  initialize: function(type, options) {
    this.options = Object.extend({
      // Controls bar viewable width and spacing between bars.
      // If a bar has a transparent width space of 1, this controls how much of that space a bar should 
      // fill
      barWidthFillFraction: 0.75,
      
      // Should the X origin start at zero.
      xOriginIsZero: true,
      
      // Should the Y origin start at zero
      yOriginIsZero: true,
      
      xAxis: new Array(),
      yAxis: new Array(),
      xTicks: null,
      yTicks: null,
      xNumberOfTicks: 10,
      yNumberOfTicks: 5,
      xTickPrecision: 1,
      yTickPrecision: 3,
      pieRadius: 0.4
    }, options || {});
    
    this.type = type;
    
    this.bars   = new Array();
    this.points = new Array();
    this.slices = new Array();
    
    this.xTicks = new Array();
    this.yTicks = new Array();
    
    this.datasets = new $H({});
    
    this.minXDelta = 0;
    this.xRange = 1;
    this.yRange = 1;
    
    this.hitTestCache = {x2maxy: null};
    
  },
  
  addDataset: function(name, data) {
    this.datasets[name] = data;
  },
  
  removeDataset: function(name) {
    this.datasets[name] = null;
    this.datasets.compact();
  },
  
  evaluate: function() {
    this._evaluateLimits();
    this._evaluateScales();
    switch (this.type) {
      case 'bar':
        this._evaluateBarCharts();
        this._evaluateBarTicks();
        break;
      case 'line':
        this._evaluateLineCharts();
        this._evaluateLineTicks();
        break;
      case 'pie':
        this._evaluatePieCharts();
        this._evaluatePieTicks();
    }
  },
  
  hitTest: function(x, y) {
    if ((this.type == "bar") && this.bars && (this.bars.length > 0)) {
        for (var i = 0; i < this.bars.length; i++) {
          var bar = this.bars[i];
          if ((x >= bar.x) && (x <= bar.x + bar.w) 
              && (y >= bar.y) && (y - bar.y <= bar.h))
              return bar;
      }
    }

    else if (this.type == "line") {
        if (this.hitTestCache.x2maxy == null) {
          this._regenerateHitTestCache();
        }

        // 1. find the xvalues that equal or closest to the give x
        var xval = x / this.xscale;
        var xvalues = this.hitTestCache.xvalues;
        var xbefore = null;
        var xafter = null;

        for (var i = 1; i < xvalues.length; i++) {
          if (xvalues[i] > xval) {
            xbefore = xvalues[i-1];
            xafter = xvalues[i];
            break;
          }
        }

        if ((xbefore != null)) {
          var ybefore = this.hitTestCache.x2maxy[xbefore];
          var yafter = this.hitTestCache.x2maxy[xafter];
          var yval = (1.0 - y)/this.yscale;

          // interpolate whether we will fall inside or outside
          var gradient = (yafter - ybefore) / (xafter - xbefore);
          var projmaxy = ybefore + gradient * (xval - xbefore);
          if (projmaxy >= yval) {
              // inside the highest curve (roughly)
              var obj = {xval: xval, yval: yval,
                         xafter: xafter, yafter: yafter,
                         xbefore: xbefore, ybefore: ybefore,
                         yprojected: projmaxy
              };
            return obj;
          }
        }
    }

    else if (this.type == "pie") {
        var dist = Math.sqrt((y-0.5)*(y-0.5) + (x-0.5)*(x-0.5));
        if (dist > this.options.pieRadius)
            return null;

        // TODO: actually doesn't work if we don't know how the Canvas
        //       lays it out, need to fix!
        var angle = Math.atan2(y - 0.5, x - 0.5) - Math.PI/2;
        for (var i = 0; i < this.slices.length; i++) {
            var slice = this.slices[i];
            if (slice.startAngle < angle && slice.endAngle >= angle)
                return slice;
        }
    }

    return null;
  },
  
  _evaluateLimits: function() {
    var all = this.datasets.pluck(1).compress();
    
    if (this.options.xAxis.hasNilValue()) {
      if (this.options.xOriginIsZero)
        this.minxval = 0;
      else
        this.minxval = all.pluck(0).min();
    }
    
    if (this.options.yAxis.hasNilValue()) {
      if (this.options.yOriginIsZero)
        this.minyval = 0;
      else
        this.minyval = all.pluck(1).min();
    }

    this.maxxval = all.pluck(0).max();
    this.maxyval = all.pluck(1).max();
    
  },
  
  _evaluateScales: function() {
    this.xrange = this.maxxval - this.minxval;
    if (this.xrange == 0)
      this.xscale = 1.0;
    else
      this.xscale = 1/this.xrange;

    this.yrange = this.maxyval - this.minyval;
    if (this.yrange == 0)
      this.yscale = 1.0;
    else
      this.yscale = 1/this.yrange;
  },
  
  _uniqueXValues: function() {
    return this.datasets.pluck(1).compress().pluck(0).uniq();
  },
  
  _evaluateBarCharts: function() {
    var setCount = this.datasets.keys().length;

    // work out how far separated values are
    var xdelta = 10000000;
    var xvalues = this._uniqueXValues();

    for (var i = 1; i < xvalues.length; i++) {
      xdelta = Math.min(Math.abs(xvalues[i] - xvalues[i-1]), xdelta);
    }

    var barWidth = 0;
    var barWidthForSet = 0;
    var barMargin = 0;
    if (xvalues.length == 1) {
        // note we have to do something smarter if we only plot one value
        xdelta = 1.0;
        this.xscale = 1.0;
        this.minxval = xvalues[0];
        barWidth = 1.0 * this.options.barWidthFillFraction;
        barWidthForSet = barWidth/setCount;
        barMargin = (1.0 - this.options.barWidthFillFraction)/2;
    }
    else {
        // readjust xscale to fix with bar charts
        this.xscale = (1.0 - xdelta/this.xrange)/this.xrange;
        barWidth = xdelta * this.xscale * this.options.barWidthFillFraction;
        barWidthForSet = barWidth / setCount;
        barMargin = xdelta * this.xscale * (1.0 - this.options.barWidthFillFraction)/2;
    }
    this.minxdelta = xdelta; // need this for tick positions
    //document.writeln("<p><code>minXVal:" + this.minxval + ', XScale:' + this.xscale + ', barWidthForSet:' + barWidthForSet + ', barMargin:' + barMargin + "</code></p>");

    // add all the rects
    this.bars = new Array();
    
    this.datasets.each(function(dataset, index) {
      dataset.value.each(function(datapair) {
        
        var rect = {
          x: ((parseFloat(datapair[0]) - this.minxval) * this.xscale) + (index * barWidthForSet) + barMargin,
          y: 1.0 - ((parseFloat(datapair[1]) - this.minyval) * this.yscale),
          w: barWidthForSet,
          h: ((parseFloat(datapair[1]) - this.minyval) * this.yscale),
          xval: parseFloat(datapair[0]),
          yval: parseFloat(datapair[1]),
          name: dataset.key 
        }
        this.bars.push(rect);
      }.bind(this));
    }.bind(this));
    
  },
  
  _evaluateLineCharts: function() {
    var setCount = this.datasets.keys().length;

    // add all the rects
    this.points = new Array();
    var i = 0;
    this.datasets.each(function(dataset) {      
      var value = dataset.value;
      
      // THIS COULD BE BROKEN, DO TEST LATER
      value.sortBy(function(item) { 
        return [parseFloat(item[0]), parseFloat(item[1])].sort();
      });
      
      // document.write( dataset + "<br />");
      value.each(function(item) {
        var point = {
            x: ((parseFloat(item[0]) - this.minxval) * this.xscale),
            y: 1.0 - ((parseFloat(item[1]) - this.minyval) * this.yscale),
            xval: parseFloat(item[0]),
            yval: parseFloat(item[1]),
            name: dataset.key
        };
        this.points.push(point);
      }.bind(this));
    }.bind(this));
  },
  
  _evaluatePieCharts: function() {

    var setCount = this.datasets.keys().length;

    // we plot the y values of the first dataset
    var dataset = this.datasets.values()[0];    
    var total = dataset.pluck(1).sum();

    this.slices = new Array();
    var currentAngle = 0.0;
    for (var i = 0; i < dataset.length; i++) {
        var fraction = dataset[i][1] / total;
		var startAngle = currentAngle * Math.PI * 2;
		var endAngle = (currentAngle + fraction) * Math.PI * 2;
			
        var slice = {fraction: fraction,
                     xval: dataset[i][0],
                     yval: dataset[i][1],
                     startAngle: startAngle,
                     endAngle: endAngle
        };
        this.slices.push(slice);
        currentAngle += fraction;
    }
  },
  
  _evaluateLineTicksForXAxis: function() {    
    if (this.options.xTicks) {
        // we use use specified ticks with optional labels

        this.xticks = new Array();
        var makeTicks = function(tick) {
            var label = tick.label;
            if (Plastik.Base.isNil(label))
                label = tick.v.toString();
            var pos = this.xscale * (tick.v - this.minxval);
            this.xticks.push([pos, label]);
        }.bind(this);
        
        this.options.xTicks.each(makeTicks);
    }
    else if (this.options.xNumberOfTicks) {
        // we use defined number of ticks as hint to auto generate
        var xvalues = this._uniqueXValues();
        var roughSeparation = this.xrange / this.options.xNumberOfTicks;
        var tickCount = 0;

        this.xticks = new Array();
        for (var i = 0; i <= xvalues.length; i++) {
            if (xvalues[i] >= (tickCount) * roughSeparation) {
                var pos = this.xscale * (xvalues[i] - this.minxval);
                if ((pos > 1.0) || (pos < 0.0))
                    return;
                this.xticks.push([pos, xvalues[i]]);
                tickCount++;
            }
            if (tickCount > this.options.xNumberOfTicks)
                break;
        }
    }
  },
  
  _evaluateLineTicksForYAxis: function() {
    if (this.options.yTicks) {
        this.yticks = new Array();
        var makeTicks = function(tick) {
            var label = tick.label;
            if (Plastik.Base.isNil(label))
              label = tick.v.toString();
            var pos = 1.0 - (this.yscale * (tick.v + this.minxval));
            if ((pos < 0.0) || (pos > 1.0))
              return;
            this.yticks.push([pos, label]);
        }.bind(this);
        
        this.options.yTicks.each(makeTicks);
    }
    else if (this.options.yNumberOfTicks) {
        // We use the optionally defined number of ticks as a guide        
        this.yticks = new Array();

        // if we get this separation right, we'll have good looking graphs
        var roundInt = Plastik.Base.roundInterval;        
        var prec = this.options.yTickPrecision;
        var roughSeparation = roundInt(this.yrange, 
                                       this.options.yNumberOfTicks,
                                       this.options.yTickPrecision);

        for (var i = 0; i <= this.options.yNumberOfTicks; i++) {
            var yval = this.minyval + (i * roughSeparation);
            var pos = 1.0 - ((yval - this.minyval) * this.yscale);
            this.yticks.push([pos, Format.roundToFixed(yval, 1)]);
        }
    }
  },
  
  _evaluateLineTicks: function() {
    this._evaluateLineTicksForXAxis();
    this._evaluateLineTicksForYAxis();
  },
  
  _evaluateBarTicks: function() {
    this._evaluateLineTicks();
    var centerInBar = function(tick) {
      return [tick[0] + (this.minxdelta * this.xscale)/2, tick[1]];
    }.bind(this);
    
    this.xticks = this.xticks.collect(function(tick) {
      return centerInBar(tick);
    });
    
  },
  
  _evaluatePieTicks: function() {
    var isNil = Plastik.Base.isNil;

      this.xticks = new Array();
  	if (this.options.xTicks) {
  		// make a lookup dict for x->slice values
  		var lookup = new Array();
  		for (var i = 0; i < this.slices.length; i++) {
  			lookup[this.slices[i].xval] = this.slices[i];
  		}

  		for (var i =0; i < this.options.xTicks.length; i++) {
  			var tick = this.options.xTicks[i];
  			var slice = lookup[tick.v]; 
              var label = tick.label;
  			if (slice) {
                  if (isNil(label))
                      label = tick.v.toString();
  				label += " (" + Format.roundToFixed(slice.fraction * 100.0, 0) + "%)";
  				this.xticks.push([tick.v, label]);
  			}
  		}
  	}
  	else {
  		// we make our own labels from all the slices
  		for (var i =0; i < this.slices.length; i++) {
  			var slice = this.slices[i];  			        
  			var label = slice.xval + " (" + Format.roundToFixed(slice.fraction * 100.0, 0)  + "%)";
  			this.xticks.push([slice.xval, label]);
  		}	
  	}
  },
  
  // FIX ME
  _regenerateHitTestCache: function() {
    this.hitTestCache.xvalues = this._uniqueXValues();
    this.hitTestCache.xlookup = new Array();
    this.hitTestCache.x2maxy = new Array();

    var listMax = MochiKit.Base.listMax;
    var itemgetter = MochiKit.Base.itemgetter;
    var map = MochiKit.Base.map;

    // generate a lookup table for x values to y values
    var setNames = this.datasets.keys();
    for (var i = 0; i < setNames.length; i++) {
        var dataset = this.datasets[setNames[i]];
        for (var j = 0; j < dataset.length; j++) {
            var xval = dataset[j][0];
            var yval = dataset[j][1];
            if (this.hitTestCache.xlookup[xval])
                this.hitTestCache.xlookup[xval].push([yval, setNames[i]]);
            else 
                this.hitTestCache.xlookup[xval] = [[yval, setNames[i]]];
        }
    }

    for (var x in this.hitTestCache.xlookup) {
        var yvals = this.hitTestCache.xlookup[x];
        this.hitTestCache.x2maxy[x] = listMax(map(itemgetter(0), yvals));
    }
  }
}

Plastik.Stage = Class.create();
Plastik.Stage.prototype = Object.extend(new Plastik.Abstract.Stage(), {
  
});

