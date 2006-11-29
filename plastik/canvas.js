Plastik.Abstract.CanvasRenderer = function() {}
Plastik.Abstract.CanvasRenderer.prototype = {
  initialize: function(element, layout, options) {
    var isNil = Plastik.Base.isNil;
    // we need to refetch the element because of this horrible Canvas on IE
    // crap
    this.element_id = element.id ? element.id : element;

    // Stuff relating to Canvas on IE support
    var self = Plastik.Abstract.CanvasRenderer;
    this.isIE = false; //self.IECanvasEmulationIfNeeded(this.options.IECanvasHTC);
    this.IEDelay = 0.5;
    this.maxTries = 5;
    this.renderDelay = null;
    this.clearDelay = null;
    this.DOM = DomBuilder.apply();

    this.layout = layout;
    this.style = layout.type;
    this.element = $(this.element_id);
    this.container = this.element.parentNode;
    this.height = this.element.height;
    this.width = this.element.width;

    var Color = Plastik.Color.Color;
    Plastik.Color.Color.whiteColor();
    Plastik.Color.Color.blackColor();
    this.options = Object.extend({  
        drawBackground: true,
        backgroundColor: Color.whiteColor(),
        padding: {left: 30, right: 30, top: 5, bottom: 10},
        colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[0]),
        strokeColor: Color.whiteColor(),
        strokeColorTransform: "asStrokeColor",
        strokeWidth: 0.5,
        shouldFill: true,
        shouldStroke: true,
        drawXAxis: true,
        drawYAxis: true,
        axisLineColor: Color.blackColor(),
        axisLineWidth: 0.5,
        axisTickSize: 3,
        axisLabelColor: Color.blackColor(),
        axisLabelFontFamily: "Times New Roman, serif",
        axisLabelFontSize: 10,
  	    axisLabelWidth: 60,
  	    pieRadius: 0.4,
        enableEvents: true,
        IECanvasHTC: "Plastik/iecanvas.htc"
    }, options || {});
    
    
    // --- check whether everything is ok before we return

    
    if (isNil(this.element))
        throw "CanvasRenderer() - passed canvas is not found";

    if (!this.isIE && !(Plastik.Abstract.CanvasRenderer.isSupported(this.element)))
        throw "CanvasRenderer() - Canvas is not supported.";

    if (isNil(this.container) || (this.container.nodeName.toLowerCase() != "div"))
        throw "CanvasRenderer() - <canvas> needs to be enclosed in <div>";

    // internal state
    this.xlabels = new Array();
    this.ylabels = new Array();
    this.isFirstRender = true;

    this.area = {
        x: this.options.padding.left,
        y: this.options.padding.top,
        w: this.width - this.options.padding.left - this.options.padding.right,
        h: this.height - this.options.padding.top - this.options.padding.bottom
    };

    this.container.setStyle({
      position: 'relative',
      width: this.width + 'px'
    });

    // load event system if we have Signals
    try {
        this.event_isinside = null;
        if (MochiKit.Signal && this.options.enableEvents) {
            this._initialiseEvents();
        }
    }
    catch (e) {
        // still experimental
    }
  },
  
  render: function() {
      if (this.isIE) {
          // VML takes a while to start up, so we just poll every this.IEDelay
          try {
              if (this.renderDelay) {
                  this.renderDelay.cancel();
                  this.renderDelay = null;
              }
              var context = this.element.getContext("2d");
          }
          catch (e) {
              this.isFirstRender = false;
              if (this.maxTries-- > 0) {
                  this.renderDelay = MochiKit.Async.wait(this.IEDelay);
                  this.renderDelay.addCallback(bind(this.render, this));
              }
              return;
          }
      }

      
      if (this.options.drawBackground)
          this._renderBackground();

      if (this.style == "bar") {
          this._renderBarChart();
  		this._renderBarAxis(); 
  	}
      else if (this.style == "pie") {
          this._renderPieChart();
  		this._renderPieAxis();
  	}
      else if (this.style == "line") {
          this._renderLineChart();
  		this._renderLineAxis();
  	}
  },
  
  _renderBarChartWrap: function(data, plotFunc) {
    var context = this.element.getContext("2d");
    var colorCount = this.options.colorScheme.length;
    var colorScheme = this.options.colorScheme;
    var setNames = this.layout.datasets.keys();
    var setCount = setNames.length;

    for (var i = 0; i < setCount; i++) {
        var setName = setNames[i];
        var color = colorScheme[i%colorCount];
        context.save();
        context.fillStyle = color.toRGBString();
        if (this.options.strokeColor)
            context.strokeStyle = this.options.strokeColor.toRGBString();
        else if (this.options.strokeColorTransform) 
            context.strokeStyle = color[this.options.strokeColorTransform]().toRGBString();
        
        context.lineWidth = this.options.strokeWidth;
        var forEachFunc = function(obj) {
            if (obj.name == setName)
                plotFunc(context, obj);
        }.bind(this);        
        
        data.each(forEachFunc);
        
        context.restore();
    }
  },
  
  _renderBarChart: function() {

    var drawRect = function(context, bar) {
        var x = this.area.w * bar.x + this.area.x;
        var y = this.area.h * bar.y + this.area.y;
        var w = this.area.w * bar.w;
        var h = this.area.h * bar.h;  
        if ((w < 1) || (h < 1))
            return;
        if (this.options.shouldFill) {
            context.fillRect(x, y, w, h);
          }
        if (this.options.shouldStroke)
            context.strokeRect(x, y, w, h);                
    }.bind(this);
    
    this._renderBarChartWrap(this.layout.bars, drawRect);
  },
  
  _renderLineChart: function() {
    var context = this.element.getContext("2d");
    var colorCount = this.options.colorScheme.length;
    var colorScheme = this.options.colorScheme;
    var setNames = this.layout.datasets.keys();
    var setCount = setNames.length;


    for (var i = 0; i < setCount; i++) {
        var setName = setNames[i];
        var color = colorScheme[i%colorCount];
        var strokeX = this.options.strokeColorTransform;

        // setup graphics context        
        context.save();
        context.fillStyle = color.toRGBString();
        if (this.options.strokeColor)
            context.strokeStyle = this.options.strokeColor.toRGBString();
        else if (this.options.strokeColorTransform) 
            context.strokeStyle = color[strokeX]().toRGBString();
        
        context.lineWidth = this.options.strokeWidth;
        
        // create paths
        var makePath = function() {
            context.beginPath();
            context.moveTo(this.area.x, this.area.y + this.area.h);
            var addPoint = function(context, point) {
            if (point.name == setName)
                context.lineTo(this.area.w * point.x + this.area.x,
                               this.area.h * point.y + this.area.y);
            }.bind(this);
            
            this.layout.points.each(function(point) {
              addPoint(context, point);
            });
            context.lineTo(this.area.w + this.area.x,
                           this.area.h + this.area.y);
            context.lineTo(this.area.x, this.area.y + this.area.h);
            context.closePath();
        }.bind(this);

        if (this.options.shouldFill) {
            makePath();
            context.fill();
        }
        if (this.options.shouldStroke) {
            makePath();
            context.stroke();
        }

        context.restore();
    }
  },
  
  _renderPieChart: function() {
      var context = this.element.getContext("2d");
      var colorCount = this.options.colorScheme.length;
      var slices = this.layout.slices;

      var centerx = this.area.x + this.area.w * 0.5;
      var centery = this.area.y + this.area.h * 0.5;
      var radius = Math.min(this.area.w * this.options.pieRadius, 
                            this.area.h * this.options.pieRadius);

      if (this.isIE) {
          centerx = parseInt(centerx);
          centery = parseInt(centery);
          radius = parseInt(radius);
      }


  	// NOTE NOTE!! Canvas Tag draws the circle clockwise from the y = 0, x = 1
  	// so we have to subtract 90 degrees to make it start at y = 1, x = 0

      for (var i = 0; i < slices.length; i++) {
          var color = this.options.colorScheme[i%colorCount];
          context.save();
          context.fillStyle = color.toRGBString();

          var makePath = function() {
              context.beginPath();
              context.moveTo(centerx, centery);
              context.arc(centerx, centery, radius, 
                          slices[i].startAngle - Math.PI/2,
                          slices[i].endAngle - Math.PI/2,
                          false);
              context.lineTo(centerx, centery);
              context.closePath();
          };

          if (Math.abs(slices[i].startAngle - slices[i].endAngle) > 0.001) {
              if (this.options.shouldFill) {
                  makePath();
                  context.fill();
              }

              if (this.options.shouldStroke) {
                  makePath();
                  context.lineWidth = this.options.strokeWidth;
                  if (this.options.strokeColor)
                      context.strokeStyle = this.options.strokeColor.toRGBString();
                  else if (this.options.strokeColorTransform)
                      context.strokeStyle = color[this.options.strokeColorTransform]().toRGBString();
                  context.stroke();
              }
          }
          context.restore();
      }
  },
  
  _renderBarAxis: function() {
    this._renderAxis();
  },
  
  _renderLineAxis: function() {
    this._renderAxis();
  },
  
  _renderAxis: function() {
    if (!this.options.drawXAxis && !this.options.drawYAxis)
        return;

    var context = this.element.getContext("2d");

    var labelStyle = {
      position: "absolute",
      fontFamily: this.options.axisLabelFontFamily,
      fontSize: this.options.axisLabelFontSize + "px",
      zIndex: 10,
      color: this.options.axisLabelColor.toRGBString(),
      width: this.options.axisLabelWidth + "px",
      overflow: "hidden"
    };

    // axis lines
    context.save();
    context.strokeStyle = this.options.axisLineColor.toRGBString();
    context.lineWidth = this.options.axisLineWidth;


    if (this.options.drawYAxis) {
        if (this.layout.yticks) {
            var drawTick = function(tick) {
                var x = this.area.x;
                var y = this.area.y + tick[0] * this.area.h;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x - this.options.axisTickSize, y);
                context.closePath();
                context.stroke();

                var label = this.DOM.DIV(tick[1]);
                $(label).setStyle(labelStyle);
                label.style.top = (y - this.options.axisLabelFontSize) + "px";
                label.style.left = (x - this.options.padding.left - this.options.axisTickSize) + "px";
                label.style.textAlign = "right";
                label.style.width = (this.options.padding.left - this.options.axisTickSize * 2) + "px";
                this.container.appendChild(label);
                this.ylabels.push(label);
            }.bind(this);
            
            this.layout.yticks.each(drawTick);
            
        }

        context.beginPath();
        context.moveTo(this.area.x, this.area.y);
        context.lineTo(this.area.x, this.area.y + this.area.h);
        context.closePath();
        context.stroke();
    }

    if (this.options.drawXAxis) {
        if (this.layout.xticks) {
            var drawTick = function(tick) {
                var x = this.area.x + tick[0] * this.area.w;
                var y = this.area.y + this.area.h;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y + this.options.axisTickSize);
                context.closePath();
                context.stroke();
                
                var label = this.DOM.DIV(tick[1]);
                label.setStyle(labelStyle);
                label.style.top = (y + this.options.axisTickSize) + "px";
                label.style.left = (x - this.options.axisLabelWidth/2) + "px";
                label.style.textAlign = "center";
                label.style.width = this.options.axisLabelWidth + "px";
                this.container.appendChild(label);
                this.xlabels.push(label);
            }.bind(this);
            this.layout.xticks.each(drawTick)
        }

        context.beginPath();
        context.moveTo(this.area.x, this.area.y + this.area.h);
        context.lineTo(this.area.x + this.area.w, this.area.y + this.area.h);
        context.closePath();
        context.stroke();
    }

    context.restore();
    
  },
  
  _renderPieAxis: function() {
      if (!this.options.drawXAxis)
          return;

  	if (this.layout.xticks) {
  		// make a lookup dict for x->slice values
  		var lookup = new Array();
  		for (var i = 0; i < this.layout.slices.length; i++) {
  			lookup[this.layout.slices[i].xval] = this.layout.slices[i];
  		}

  		var centerx = this.area.x + this.area.w * 0.5;
  	    var centery = this.area.y + this.area.h * 0.5;
  	    var radius = Math.min(this.area.w * this.options.pieRadius,
  	                          this.area.h * this.options.pieRadius);
  		var labelWidth = this.options.axisLabelWidth;

  		for (var i = 0; i < this.layout.xticks.length; i++) {
  			var slice = lookup[this.layout.xticks[i][0]];
  			if (Plastik.Base.isNil(slice))
  				continue;


  			var angle = (slice.startAngle + slice.endAngle)/2;
  			// normalize the angle
  			var normalisedAngle = angle;
  			if (normalisedAngle > Math.PI * 2)
  				normalisedAngle = normalisedAngle - Math.PI * 2;
  			else if (normalisedAngle < 0)
  				normalisedAngle = normalisedAngle + Math.PI * 2;

  			var labelx = centerx + Math.sin(normalisedAngle) * (radius + 10);
  	        var labely = centery - Math.cos(normalisedAngle) * (radius + 10);

  			var attrib = {
  			  position: "absolute",
          zIndex: 11,
          width: labelWidth + "px",
          fontFamily: this.options.axisLabelFontFamily,
          fontSize: this.options.axisLabelFontSize + "px",
          overflow: "hidden",
          color: this.options.axisLabelColor.toHexString()
  			};

  			if (normalisedAngle <= Math.PI * 0.5) {
  	            // text on top and align left
  	            attrib["textAlign"] = "left";
  	            attrib["verticalAlign"] = "top";
  	            attrib["left"] = labelx + "px";
  	            attrib["top"] = (labely - this.options.axisLabelFontSize) + "px";
  	        }
  	        else if ((normalisedAngle > Math.PI * 0.5) && (normalisedAngle <= Math.PI)) {
  	            // text on bottom and align left
  	            attrib["textAlign"] = "left";
  	            attrib["verticalAlign"] = "bottom";     
  	            attrib["left"] = labelx + "px";
  	            attrib["top"] = labely + "px";

  	        }
  	        else if ((normalisedAngle > Math.PI) && (normalisedAngle <= Math.PI*1.5)) {
  	            // text on bottom and align right
  	            attrib["textAlign"] = "right";
  	            attrib["verticalAlign"] = "bottom"; 
  	            attrib["left"] = (labelx  - labelWidth) + "px";
  	            attrib["top"] = labely + "px";
  	        }
  	        else {
  	            // text on top and align right
  	            attrib["textAlign"] = "right";
  	            attrib["verticalAlign"] = "bottom";  
  	            attrib["left"] = (labelx  - labelWidth) + "px";
  	            attrib["top"] = (labely - this.options.axisLabelFontSize) + "px";
  	        }

  			var label = this.DOM.DIV(this.layout.xticks[i][1]);
  			label.setStyle(attrib);
  			this.xlabels.push(label);
  			this.container.appendChild(label);
  	  }

  	}
  },
  
  _renderBackground: function() {
    var context = this.element.getContext("2d");
    context.save();
    context.fillStyle = this.options.backgroundColor.toRGBString();
    context.fillRect(0, 0, this.width, this.height);
    context.restore();
  },
  
  _clear: function() {
    if (this.isIE) {
        // VML takes a while to start up, so we just poll every this.IEDelay
        try {
            if (this.clearDelay) {
                this.clearDelay.cancel();
                this.clearDelay = null;
            }
            var context = this.element.getContext("2d");
        }
        catch (e) {
            this.isFirstRender = false;
            this.clearDelay = MochiKit.Async.wait(this.IEDelay);
            this.clearDelay.addCallback(bind(this.clear, this));
            return;
        }
    }

    var context = this.element.getContext("2d");
    context.clearRect(0, 0, this.width, this.height);

    
    for (var i = 0; i < this.xlabels.length; i++) {
        MochiKit.DOM.removeElement(this.xlabels[i]);
    }        
    for (var i = 0; i < this.ylabels.length; i++) {
        MochiKit.DOM.removeElement(this.ylabels[i]);
    }            
    this.xlabels = new Array();
    this.ylabels = new Array();
    
  },
  
  _initializeEvents: function() {
    var connect = MochiKit.Signal.connect;
    var bind = MochiKit.Base.bind;
    MochiKit.Signal.registerSignals(this, ['onmouseover', 'onclick', 'onmouseout', 'onmousemove']);
    //connect(this.element, 'onmouseover', bind(this.onmouseover, this));
    //connect(this.element, 'onmouseout', bind(this.onmouseout, this));
    //connect(this.element, 'onmousemove', bind(this.onmousemove, this));
    connect(this.element, 'onclick', bind(this.onclick, this));
  },
  
  _resolveEventObject: function(e) {
      // does not work in firefox
  	//var x = (e.event().offsetX - this.area.x) / this.area.w;
  	//var y = (e.event().offsetY - this.area.y) / this.area.h;

      var x = (e.mouse().page.x - PlotKit.Base.findPosX(this.element) - this.area.x) / this.area.w;
      var y = (e.mouse().page.y - PlotKit.Base.findPosY(this.element) - this.area.y) / this.area.h;

      //log(x, y);

      var isHit = this.layout.hitTest(x, y);
      if (isHit)
          return isHit;
      return null;
  },
  
  _createEventObject: function(layoutObj, e) {
    // does not work in firefox
  	//var x = (e.event().offsetX - this.area.x) / this.area.w;
  	//var y = (e.event().offsetY - this.area.y) / this.area.h;

      var x = (e.mouse().page.x - PlotKit.Base.findPosX(this.element) - this.area.x) / this.area.w;
      var y = (e.mouse().page.y - PlotKit.Base.findPosY(this.element) - this.area.y) / this.area.h;

      //log(x, y);

      var isHit = this.layout.hitTest(x, y);
      if (isHit)
          return isHit;
      return null;
  }
}

Object.extend(Plastik.Abstract.CanvasRenderer, {
  isSupported: function(canvasName) {
    var canvas = null;
    try {
        if (Plastik.Base.isNil(canvasName)) 
          canvas = document.createElement('canvas');
        else
          canvas = $(canvasName);
        var context = canvas.getContext("2d");
    }
    catch (e) {
        var ie = navigator.appVersion.match(/MSIE (\d\.\d)/);
        var opera = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
        if ((!ie) || (ie[1] < 6) || (opera))
            return false;
        return true;
    }
    return true;
  }
});

Plastik.CanvasRenderer = Class.create();
Plastik.CanvasRenderer.prototype = Object.extend(new Plastik.Abstract.CanvasRenderer(), {});
