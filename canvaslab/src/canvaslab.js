<%= include 'HEADER' %>

var CanvasLab = new Base();
CanvasLab.Version = '<%= CANVASLAB_VERSION %>';

CanvasLab.Base = Base.extend({
  constructor: function(element, options) {
   this.canvas = $(element);
   this.container = this.canvas.parentNode;
   if(!this.canvas.getContext) {
     this.canvas = G_vmlCanvasManager.initElement(this.canvas);
   }
   this.context = this.canvas.getContext('2d');
   this.datasets = new CanvasLab.Collection();
   this.DOM = ToolKit.DomBuilder.apply();
   this.yLabels = [];
   this.xLabels = [];   
   this.options = Object.extend({
     xTicksCount: 10,
     yTicksCount: 5,
     xOriginZero: true,
     yOriginZero: true,
     xTickPrecision: 1,
     yTickPrecision: 3,
     xAxisRange: $R(0, 0),
     yAxisRange: $R(0, 0)
   }, options || {});
   
   this.theme = Object.extend(new CanvasLab.Theme().baseOptions, this.options.theme || {});
   console.log(this.options);
   this.colors = this.theme.colorScheme.colors.concat(this.theme.colorScheme.darkenColors());
   this.stage = null;
   
   this.area = {
       x: this.theme.padding.left,
       y: this.theme.padding.top,
       width: this.canvas.width - this.theme.padding.left - this.theme.padding.right,
       height: this.canvas.height - this.theme.padding.top - this.theme.padding.bottom
   };
   
    var border = $w('left right').collect(function(prop) {
      return parseInt(this.canvas.getStyle('border-' + prop + '-width'));
    }.bind(this));

    Element.setStyle(this.container, {
      position: 'relative',
      width: this.canvas.width + border[0] + border[1] + 'px';
    });
   },
  
  draw: function() {
    throw 'Must be implemented in a subclass';
  },
  
  drawBackground: function() {
    this.context.save();
    this.context.fillStyle = this.theme.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.strokeStyle = ToolKit.Color.whiteColor().toRGBString();
    this.context.lineWidth = 1.0;
    
    this.stage.xTicks.each(function(tick) {
      this.context.beginPath();
      
      if(!this.options.horizontal) {
        var y = tick[0] * this.area.height + this.area.y;
        var x = this.area.x;
        this.context.moveTo(x, y);
        this.context.lineTo(x + this.area.width, y);
      } else {
        var y = tick[0] * this.area.width + this.area.x;
        var x = this.area.y;
        this.context.moveTo(y, x);
        this.context.lineTo( y, x + this.area.height);
      }

      this.context.closePath();
      this.context.stroke();
    }.bind(this));
    this.context.restore();
  },
  
  drawAxis: function() {
    var labelStyle = {
      position: "absolute",
      fontFamily: this.theme.fontFamily,
      fontSize: this.theme.fontSize + 'px',
      zIndex: 10,
      color: this.theme.fontColor,
      width: this.theme.axisLabelWidth + 'px',
      overflow: "hidden"
    };

    this.context.save();
    this.context.strokeStyle = this.theme.axisColor;
    this.context.lineWidth = this.theme.axisLineWidth;

    if (this.stage.yTicks) {
      this.stage.yTicks.each(function(tick) {        
        var x = this.area.x;
        var y = this.area.y + tick[0] * this.area.height;
        
        if(this.theme.drawXTicks) {
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.lineTo(x - this.theme.axisTickSize, y);
          this.context.stroke();
        }
        
        var label = this.DOM.DIV(tick[1]);
        $(label).setStyle(labelStyle);
        label.style.top = (y - this.theme.fontSize/1.7) + "px";
        label.style.left = (x - this.theme.padding.left - this.theme.axisTickSize) + "px";
        label.style.textAlign = "right";
        label.style.width = (this.theme.padding.left - this.theme.axisTickSize * 2) + "px";
        this.container.appendChild(label);
        this.yLabels.push(label);
        
      }.bind(this));
    }
    
      if(this.theme.drawXAxis) {
        this.context.beginPath();
        this.context.moveTo(this.area.x, this.area.y - 1);
        this.context.lineTo(this.area.x, this.area.y + this.area.height);
        this.context.closePath();
        this.context.stroke();
      }

    if (this.stage.xTicks) {
      
      this.stage.xTicks.each(function(tick) {
        var x = this.area.x + tick[0] * this.area.width;
        var y = this.area.y + this.area.height;
        
        if(this.theme.drawYTicks) {
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.lineTo(x, y + this.theme.axisTickSize);
          this.context.closePath();
          this.context.stroke();
        }
        
        var label = this.DOM.DIV(tick[1]);
        Element.setStyle(label, labelStyle);
        label.style.top = (y + this.theme.axisTickSize) + "px";
        label.style.left = (x - (this.theme.axisLabelWidth/2)) + "px";
        label.style.textAlign = "center";
        label.style.width = this.theme.axisLabelWidth + "px";
        this.container.appendChild(label);
        this.xLabels.push(label);
      }.bind(this));
    }

    if(this.theme.drawYAxis) {
      this.context.beginPath();
      this.context.moveTo(this.area.x, this.area.y + this.area.height);
      this.context.lineTo(this.area.x + this.area.width, this.area.y + this.area.height);
      this.context.closePath();
      this.context.stroke();
    }

    this.context.restore();
  },
  
  drawRectangle: function(plane) {
    var x = this.area.width  * plane.x + this.area.x;
    var y = this.area.height * plane.y + this.area.y;
    var w = this.area.width  * plane.width;
    var h = this.area.height * plane.height; 
     
    if ((w < 1) || (h < 1))
      return;
        
    if (this.theme.fill)
      this.context.fillRect(x, y, w, h);
        
    if (this.theme.stroke)
      this.context.strokeRect(x, y, w, h);
      
  },
  
  drawSlice: function(slice, coords) {
    this.context.beginPath();
    this.context.moveTo(coords.centerX, coords.centerY);
    this.context.arc(coords.centerX, coords.centerY, coords.radius, 
                slice.startAngle - Math.PI/2,
                slice.endAngle - Math.PI/2,
                false);
    this.context.lineTo(coords.centerX, coords.centerY);
    this.context.closePath();
  },
  
  drawPath: function(setName, points) {
    this.context.beginPath();
    this.context.moveTo(this.area.x, this.area.y + this.area.height);

    var points = points.select(function(point) {
      return point.name == setName;
    });
    
    points.each(function(point, index) {
      if(!this.closedPath && (index == 0)) {
        this.context.moveTo(this.area.width * point.x + this.area.x, 
                            this.area.height * point.y + this.area.y);
      }  else {
        this.context.lineTo(this.area.width * point.x + this.area.x, 
                            this.area.height * point.y + this.area.y);
      }                   
    }.bind(this));
      
    if(this.closedPath) {
      this.context.lineTo(this.area.width + this.area.x, this.area.height + this.area.y);
      this.context.lineTo(this.area.x, this.area.y + this.area.height);
      this.context.closePath();
    }    
  },
  
  addDataset: function() {
    var args = $A(arguments), name = args.shift();
    this.datasets.addRecord(name, args);
  },
  
  setXLabels: function(labels) {
    if(labels.constructor == Array)
      this.datasets.xLabels = labels;
    else
      this.datasets.xLabels = $H(labels);
  },
  
  setYLabels: function(labels) {
    if(labels.constructor == Array)
      this.datasets.yLabels = labels;
    else
      this.datasets.yLabels = $H(labels);
  }
});


<%= include 'stage.js', 'area.js', 'line.js', 'bar.js', 'pie.js', 'dataset.js', '../lib/toolkit.js', 'theme.js' %>



